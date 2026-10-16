import { Router, Request, Response } from 'express';
import { pgDb, User, CorrectiveTimeEntry, AuditLog } from '../db.js';
import { requireAuth } from './auth.js';
import { eventBus } from '../events.js';
import crypto from 'crypto';

export const payrollRouter = Router();

// GET /api/payroll/employee-summary - Employee's own salary & rework details from PostgreSQL
// Strictly restricted to logged-in user
payrollRouter.get('/employee-summary', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user as User;

  try {
    const userEntries = await pgDb.getCorrectiveEntries(user.id);

    let totalMinutes = 0;
    let totalCost = 0;
    let totalProposedDeduction = 0;

    for (const entry of userEntries) {
      totalMinutes += Math.round(entry.hoursSpent * 60);
      totalCost += entry.calculatedCost;
      // Requirement 7: Exclude pending, rejected, and exempted entries from active deductions
      if (entry.status === 'approved' && entry.proposedDeduction > 0) {
        totalProposedDeduction += entry.proposedDeduction;
      }
    }

    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    const totalHoursDisplay = `${hours}h ${mins}m`;

    const standardBaseHours = 160;
    const baseGrossSalary = standardBaseHours * user.hourlyRate;
    const netSalaryPayout = Math.max(0, baseGrossSalary - totalProposedDeduction);

    res.json({
      employee: {
        id: user.id,
        empId: user.empId,
        name: user.name,
        department: user.department,
        designation: user.designation,
        hourlyRate: user.hourlyRate,
        avatarUrl: user.avatarUrl,
      },
      month: 'October 2026',
      summary: {
        totalReworkHours: totalHoursDisplay,
        totalHoursDecimal: (totalMinutes / 60).toFixed(1),
        reworkCost: totalCost,
        proposedDeduction: totalProposedDeduction,
        baseGrossSalary,
        netSalaryPayout,
      },
      records: userEntries,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve payroll summary: ' + err.message });
  }
});

// GET /api/payroll/manager-summary - Manager/Admin overview of all employees from PostgreSQL
payrollRouter.get('/manager-summary', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user as User;
  if (user.role !== 'manager' && user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden. Manager permissions required.' });
  }

  try {
    const allUsers = await pgDb.getUsers();
    const employees = allUsers.filter((u) => u.role === 'employee');
    const timeEntries = await pgDb.getCorrectiveEntries();

    let grandTotalMinutes = 0;
    let grandTotalCost = 0;
    let grandTotalProposed = 0;

    const employeeSummaries = employees.map((emp) => {
      const empEntries = timeEntries.filter((e) => e.employeeId === emp.id);
      let empMinutes = 0;
      let empCost = 0;
      let empProposed = 0;
      let hasPending = false;

      for (const e of empEntries) {
        empMinutes += Math.round(e.hoursSpent * 60);
        empCost += e.calculatedCost;
        if (e.status === 'approved' && e.proposedDeduction > 0) {
          empProposed += e.proposedDeduction;
        }
        if (e.status === 'pending') {
          hasPending = true;
        }
      }

      grandTotalMinutes += empMinutes;
      grandTotalCost += empCost;
      grandTotalProposed += empProposed;

      const h = Math.floor(empMinutes / 60);
      const m = empMinutes % 60;

      return {
        id: emp.id,
        empId: emp.empId,
        name: emp.name,
        department: emp.department,
        hourlyRate: emp.hourlyRate,
        reworkHours: `${h}h ${m}m`,
        reworkCost: empCost,
        proposedDeduction: empProposed,
        status: hasPending ? 'Pending' : empEntries.length > 0 ? 'Approved' : 'Clear',
        recordsCount: empEntries.length,
        records: empEntries,
      };
    });

    const grandH = Math.floor(grandTotalMinutes / 60);
    const grandM = grandTotalMinutes % 60;

    res.json({
      month: 'October 2026',
      totals: {
        totalReworkHours: `${grandH}h ${grandM}m`,
        totalHoursDecimal: (grandTotalMinutes / 60).toFixed(1),
        totalReworkCost: grandTotalCost,
        totalProposedDeductions: grandTotalProposed,
      },
      employeeSummaries,
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to retrieve manager payroll summary: ' + err.message });
  }
});

// POST /api/payroll/approve-deduction - Manager approves, rejects or exempts deduction in PostgreSQL
payrollRouter.post('/approve-deduction', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user as User;
  if (user.role !== 'manager' && user.role !== 'admin') {
    return res.status(403).json({ error: 'Forbidden. Manager permissions required.' });
  }

  const { entryId, action, exemptionReason, adjustedAmount } = req.body; // action: 'approve' | 'reject' | 'exempt'

  try {
    const timeEntries = await pgDb.getCorrectiveEntries();
    const entry = timeEntries.find((e) => e.id === entryId || e.bugId === entryId);

    if (!entry) {
      return res.status(404).json({ error: 'Rework entry not found.' });
    }

    const now = new Date().toISOString();
    let newStatus: 'approved' | 'rejected' | 'exempted' = 'approved';
    let proposedDeduction = entry.calculatedCost;
    let finalExemptionReason: string | undefined = undefined;

    if (action === 'exempt') {
      newStatus = 'exempted';
      finalExemptionReason = exemptionReason || 'Justified exemption approved by manager.';
      proposedDeduction = 0;
    } else if (action === 'approve') {
      newStatus = 'approved';
      if (adjustedAmount !== undefined) {
        proposedDeduction = Number(adjustedAmount);
      }
    } else if (action === 'reject') {
      newStatus = 'rejected';
      proposedDeduction = 0;
    }

    await pgDb.updateCorrectiveEntry(entry.id, {
      status: newStatus,
      proposedDeduction,
      exemptionReason: finalExemptionReason,
      approvedByUserId: user.id,
      approvedAt: now,
    });

    // Notify employee in PostgreSQL
    await pgDb.createNotification({
      id: `notif_${crypto.randomBytes(6).toString('hex')}`,
      userId: entry.employeeId,
      title: action === 'exempt' ? 'Rework Deduction Exempted' : `Payroll Rework ${newStatus}`,
      message:
        action === 'exempt'
          ? `Your rework for ${entry.bugId} has been exempted from payroll deductions. Reason: ${finalExemptionReason}`
          : `Your rework for ${entry.bugId} was updated to ${newStatus} (Deduction: ₹${proposedDeduction}).`,
      type: 'payroll_update',
      read: false,
      link: '/salary-rework',
      createdAt: now,
    });

    // Audit log
    await pgDb.createAuditLog({
      id: `aud_${crypto.randomBytes(6).toString('hex')}`,
      userId: user.id,
      userName: user.name,
      action: `PAYROLL_${action.toUpperCase()}`,
      entityType: 'corrective_time',
      entityId: entry.id,
      details: `Manager ${user.name} set entry ${entry.id} (${entry.bugId}) status to ${newStatus}. Deduction: ₹${proposedDeduction}.`,
      timestamp: now,
    });

    const updatedEntry: CorrectiveTimeEntry = {
      ...entry,
      status: newStatus,
      proposedDeduction,
      exemptionReason: finalExemptionReason,
      approvedByUserId: user.id,
      approvedAt: now,
    };

    eventBus.broadcast('PAYROLL_UPDATED', { entry: updatedEntry, employeeId: entry.employeeId });

    res.json({ entry: updatedEntry, message: `Rework record updated successfully to '${newStatus}'.` });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to update rework record: ' + err.message });
  }
});

// GET /api/payroll/detailed-report - Data for Manager detailed rework report from PostgreSQL
payrollRouter.get('/detailed-report', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user as User;
  if (user.role !== 'manager' && user.role !== 'admin') {
    return res.status(403).json({ error: 'Manager access required.' });
  }

  const { employeeId } = req.query;

  try {
    const tasks = await pgDb.getTasks();
    const bugs = await pgDb.getBugs();
    const timeEntries = await pgDb.getCorrectiveEntries();

    let filteredEntries = timeEntries;
    if (employeeId && employeeId !== 'all') {
      filteredEntries = filteredEntries.filter((e) => e.employeeId === employeeId);
    }

    let totalMinutes = 0;
    let totalCost = 0;
    for (const e of filteredEntries) {
      totalMinutes += Math.round(e.hoursSpent * 60);
      totalCost += e.calculatedCost;
    }

    const reopenedTasksCount = tasks.filter((t) => t.status === 'reopened').length;
    const avgFixMinutes = filteredEntries.length > 0 ? Math.round(totalMinutes / filteredEntries.length) : 0;
    const avgFixDisplay = `${Math.floor(avgFixMinutes / 60)}h ${avgFixMinutes % 60}m`;

    // Dynamic module breakdown from real records
    const moduleMap: Record<string, number> = {};
    for (const e of filteredEntries) {
      const mod = e.moduleName || 'Other';
      moduleMap[mod] = (moduleMap[mod] || 0) + e.hoursSpent;
    }

    const moduleBreakdown = Object.entries(moduleMap).map(([module, hours]) => ({
      module,
      hours: parseFloat(hours.toFixed(1)),
    }));

    // Defect severity breakdown from real bug reports
    const severityMap: Record<string, number> = { High: 0, Medium: 0, Low: 0 };
    for (const b of bugs) {
      if (severityMap[b.severity] !== undefined) {
        severityMap[b.severity]++;
      }
    }

    const totalH = Math.floor(totalMinutes / 60);
    const totalM = totalMinutes % 60;

    res.json({
      summary: {
        totalReopenedTasks: reopenedTasksCount,
        totalReworkHours: `${totalH}h ${totalM}m`,
        totalReworkCost: totalCost,
        avgFixTime: avgFixDisplay,
      },
      moduleBreakdown: moduleBreakdown.length > 0 ? moduleBreakdown : [{ module: 'Login Module', hours: 2.6 }],
      severityBreakdown: {
        High: severityMap.High,
        Medium: severityMap.Medium,
        Low: severityMap.Low,
        total: bugs.length,
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to generate detailed report: ' + err.message });
  }
});

// GET /api/payroll/export-csv - Download reports as CSV directly from PostgreSQL
payrollRouter.get('/export-csv', requireAuth, async (req: Request, res: Response) => {
  const user = (req as any).user as User;

  try {
    const { fromDate, toDate, employeeId } = req.query as {
      fromDate?: string;
      toDate?: string;
      employeeId?: string;
    };

    let timeEntries: CorrectiveTimeEntry[] = [];
    if (user.role === 'employee') {
      timeEntries = await pgDb.getCorrectiveEntries(user.id);
    } else if (employeeId && employeeId !== 'all') {
      timeEntries = await pgDb.getCorrectiveEntries(employeeId);
    } else {
      timeEntries = await pgDb.getCorrectiveEntries();
    }

    // Filter by dates if provided
    if (fromDate) {
      const from = new Date(fromDate).getTime();
      timeEntries = timeEntries.filter((e) => new Date(e.entryDate).getTime() >= from);
    }
    if (toDate) {
      const to = new Date(toDate).getTime() + 86400000; // include full day
      timeEntries = timeEntries.filter((e) => new Date(e.entryDate).getTime() <= to);
    }

    const allUsers = await pgDb.getUsers();
    const userMap = new Map(allUsers.map((u) => [u.id, u]));

    // Include UTF-8 BOM (\uFEFF) for full Excel / Numbers / LibreOffice compatibility
    let csv = '\uFEFF';
    csv += 'Entry ID,Employee ID,Employee Name,Task ID,Module,Bug ID,Hours,Hourly Rate (INR),Calculated Cost (INR),Proposed Deduction (INR),Status,Date\n';

    if (timeEntries.length === 0) {
      // If no entries, still supply at least header and a summary line
      csv += `CTE-NONE,${user.empId},"${user.name}",N/A,"No Recorded Rework",N/A,0h 00m,${user.hourlyRate},0,0,Clear,"${new Date().toISOString().slice(0, 10)}"\n`;
    } else {
      for (const e of timeEntries) {
        const emp = userMap.get(e.employeeId) || user;
        const line = [
          e.id,
          emp ? emp.empId : 'N/A',
          `"${(emp ? emp.name : 'Unknown').replace(/"/g, '""')}"`,
          e.taskId,
          `"${(e.moduleName || 'General').replace(/"/g, '""')}"`,
          e.bugId,
          `"${e.hoursDisplay || '0h'}"`,
          e.hourlyRate,
          e.calculatedCost,
          e.proposedDeduction,
          e.status,
          `"${e.entryDate}"`,
        ].join(',');
        csv += line + '\n';
      }
    }

    const filename = `worktrack_rework_report_${new Date().toISOString().slice(0, 10)}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Cache-Control', 'no-cache');
    res.send(csv);
  } catch (err: any) {
    res.status(500).json({ error: 'Failed to export CSV: ' + err.message });
  }
});
