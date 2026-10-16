# WorkTrack — Rework-Aware Task Tracking & Payroll Deduction System
## Complete Implementation & Setup Documentation

---

### 1. Project Overview & Corporate Visual Identity
WorkTrack is an enterprise-grade quality control, task tracking, and payroll adjustment platform.
The interface has been redesigned using a modern B2B SaaS corporate aesthetic:
- **Primary Color — Deep Navy (`#12345A`)**: Sidebar, corporate brand marks, primary headings.
- **Secondary Color — Industrial Blue (`#2563EB`)**: Primary action buttons, active navigation, progress indicators.
- **Accent Color — Teal (`#0D9488`)**: Positive progress, approved work, live synchronization status, productivity accents.
- **Signature Corporate Gradient**: `linear-gradient(120deg, #12345A 0%, #2563EB 52%, #0D9488 100%)`
- **Soft Corporate Gradient**: `linear-gradient(135deg, #EFF6FF 0%, #F0FDFA 100%)`
- **Neutral Palette**: Canvas (`#F5F7FB`), Cards (`#FFFFFF`), Text (`#172033`), Muted (`#64748B`), Border (`#E2E8F0`).

### 2. Operational Enhancements & New Features
- **Prominent `+ Create Task` Modal**: Organized into logical sections (Task Information, Assignment & Schedule, Planning & Instructions) with instant database insertion and live SSE notification to the assigned employee.
- **Executive Manager Dashboard**: 8 high-priority summary cards, live milestone progress bars, QA defect status, and direct triage links.
- **Action-Oriented Employee Hub**: Distinct visual badges for normal development vs. corrective maintenance rework, persistent server-backed timer (`02:36:18`), and password re-authentication.
- **Transparent Payroll Engine**: Detailed breakdown with gross base (160h benchmark), itemized rework deductions, defect exemptions, and net salary payout preview.
- **Responsive Shell**: Collapsible sidebar on desktop, mobile navigation drawer, and search filtering across tasks and defects.
- **Screen 1: Login Page (Common)**
  - Dual-panel layout: WorkTrack branding, vector artwork showcase, key features.
  - Email or Employee ID with Password (show/hide toggle), Role selector.
  - Quick 1-click Test Accounts for rapid verification.
  - Determines authentic role from the database account.
- **Screen 2: Employee Dashboard**
  - Personal details (John Doe, EMP001, Developer / IT), avatar.
  - 4 Stat Cards: Total Tasks (8), Completed (4), In Progress (3), Overdue (1).
  - "My Tasks" table with progress bars, deadlines, and status badges.
  - "Upcoming Deadlines" side panel with urgent indicators.
  - Active rework alert banner with direct access to assigned defects.
- **Screen 3: Task Details & Submission (Employee)**
  - Header badge with Task ID (`T-002 Payment Gateway`) and status badge.
  - Deliverable submission form (file selector, optional submission notes).
  - Versioned "Submission History" side panel (`v1.2.zip`, `v1.3.zip`).
- **Screen 4: Tester Dashboard & Bug Report**
  - Stat cards: Total Modules (12), Tested (8), Bugs Found (3).
  - "Submitted Modules" queue with Pass/Fail badges.
  - "Create Bug Report" form: Title, linked task, module, severity (High/Med/Low), steps to reproduce, expected vs actual result, and evidence attachment.
  - Automatically reopens completed tasks upon defect submission and links original delivery engineer.
- **Screen 5: Manager/Admin Dashboard**
  - Stat cards: Total Employees (8), Total Tasks (45), Completed (32), Overdue (5).
  - "Employee Progress" table with real-time progress bars and status indicators.
  - "Project Overview" with circular gauge (71% Completed) and rework hours/cost summary.
- **Screen 6: Bug Review & Assignment (Manager)**
  - Dual-panel interface: Tester defect details vs Assignment controls.
  - Clear separation between original delivering employee and assigned fixer.
  - Correction deadline datepicker and manager instructions.
  - Defect Exemption action with justified reason dialog.
- **Screen 7: Employee Bug-Fixing Module (Full 4-Subscreen Flow)**
  - **Subscreen 1 (Open)**: Assigned defect details, severity, deadline, tabs for details and manager comments, "Open Rework Module" button.
  - **Subscreen 2 (Auth Modal)**: Password-protected modal preventing unauthorized rework access.
  - **Subscreen 3 (Timer Running)**: Live digital clock (`02:36:18`), persistent server-backed session, pause/resume controls, progress percentage slider, fix description, and attachments.
  - **Subscreen 4 (Confirmation)**: Green checkmark badge, Bug ID, Task ID, Time Spent, Submission Date, status, and automatic timer stop.
- **Screen 8: Manager Progress Monitoring & Approval**
  - "Bug Fix Progress" table: Bug ID, Task ID, Employee, Progress, Fixing Time, Deadline, Status.
  - "Detailed View": Deliverable files, submission notes, "Approve Fix" and "Request Changes" workflow with comments.
- **Screen 9: Rework Cost & Reports**
  - Total Rework Hours (18h), Rework Cost (₹5,400), Payroll Adjustments (₹2,000).
  - Rework Details table with verified entries and approval statuses.
  - Bar chart: "Rework Hours by Employee" (John Doe, Alex Kumar, Priya Sharma, Rahul Verma).
  - Donut chart: "Recurring Defects" (Login 40%, Payment 30%, Reporting 20%, Others 10%).
  - CSV Export button.
- **Screen 10 (Additional): Employee Salary & Rework Details (Self View)**
  - Scoped strictly to logged-in user.
  - Total rework hours, calculated rework cost, and proposed deductions.
  - My Rework Records table with itemized defect cost entries.
- **Screen 11 (Additional): Manager Salary & Rework Details (All Employees)**
  - Overview of all employee rework hours and deductions.
  - Manager review actions: Approve, Reject, or Exempt with formal justification.
- **Screen 12 (Additional): Manager Detailed Rework Report**
  - Date-range and employee filters, module distribution chart, severity breakdown, and recent activity timeline.

---

### 3. Test Accounts Credentials
All test accounts are pre-seeded in the database with the default password: **`password123`**:

| Name | Role | Employee ID | Email | Default Password |
|---|---|---|---|---|
| **John Doe** | Employee / Developer | `EMP001` | `john.doe@worktrack.com` | `password123` |
| **Jane Smith** | Employee / Backend | `EMP002` | `jane.smith@worktrack.com` | `password123` |
| **Alex Kumar** | Employee / Frontend | `EMP003` | `alex.kumar@worktrack.com` | `password123` |
| **Priya Sharma** | Employee / Fullstack | `EMP004` | `priya.sharma@worktrack.com` | `password123` |
| **Sarah Tester** | Tester / QA | `TST001` | `tester@worktrack.com` | `password123` |
| **Michael Scott** | Manager | `MGR001` | `manager@worktrack.com` | `password123` |
| **Admin Director**| Admin | `ADM001` | `admin@worktrack.com` | `password123` |

*Tip: You can use the "Switch Role" dropdown in the top header or the 1-click test buttons on the login screen to switch identities instantly.*

---

### 4. Live Synchronization Cases Implemented
- **Case A (Bug Assignment)**: Assigning a bug from Employee A to Employee B immediately updates both dashboards, adds an audit entry, and notifies Employee B.
- **Case B (Deadline Change)**: Manager changes the correction deadline; assignee is alerted and overdue indicators recalculate.
- **Case C (New Bug Reported)**: Tester submits a defect; original task is linked, reopened, and deliverer preserved.
- **Case D (Fix Submitted)**: Employee completes corrective work; persistent timer stops, hours are recorded, and bug enters manager review queue.
- **Case E (Manager Requests Changes)**: Manager returns fix with comments; bug status reverts to fixing state with feedback displayed.
- **Case F (Fix Approved)**: Manager verifies fix; approved hours become eligible for payroll deduction calculations.
- **Case G (Payroll Adjustment)**: Manager approves or exempts a defect deduction; employee's personal salary view updates automatically.

---

### 5. Local Setup Instructions (XAMPP / PostgreSQL)

#### Option A: Running in the Current Node/Vite Environment
1. Ensure dependencies are installed:
   ```bash
   npm install
   ```
2. Start the full-stack server (runs on port 3000):
   ```bash
   npm run dev
   ```
3. Open `http://localhost:3000` in your browser.

#### Option B: Deploying with PostgreSQL / XAMPP
1. **Database Schema Setup**:
   - Start your PostgreSQL server (or XAMPP with MySQL/PostgreSQL add-on).
   - Create the database:
     ```sql
     CREATE DATABASE worktrack_db;
     ```
   - Run the DDL schema from `/database/schema.sql`:
     ```bash
     psql -U postgres -d worktrack_db -f database/schema.sql
     ```
   - Seed the initial showcase data:
     ```bash
     psql -U postgres -d worktrack_db -f database/seed.sql
     ```
2. **Environment Variables**:
   Copy `.env.example` to `.env` and set:
   ```env
   PORT=3000
   DATABASE_URL=postgresql://postgres:password@localhost:5432/worktrack_db
   ```
