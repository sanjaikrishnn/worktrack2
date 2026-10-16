import React, { useState, useEffect } from 'react';
import { User, Task } from '../types';
import {
  X,
  PlusCircle,
  Briefcase,
  UserCheck,
  Calendar,
  AlertCircle,
  Clock,
  Layers,
  FileText,
  Sparkles,
} from 'lucide-react';
import { apiCreateTask, apiGetUsers } from '../services/api';

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTaskCreated: () => void;
}

export const CreateTaskModal: React.FC<CreateTaskModalProps> = ({ isOpen, onClose, onTaskCreated }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [moduleName, setModuleName] = useState('Payment Gateway');
  const [assignedToUserId, setAssignedToUserId] = useState('');
  const [deadline, setDeadline] = useState('2025-10-25');
  const [priority, setPriority] = useState<'High' | 'Medium' | 'Low'>('Medium');
  const [estimatedHours, setEstimatedHours] = useState('16');
  const [instructions, setInstructions] = useState('');

  const [employees, setEmployees] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      apiGetUsers().then((res) => {
        const emps = res.users.filter((u) => u.role === 'employee');
        setEmployees(emps);
        if (emps.length > 0 && !assignedToUserId) {
          setAssignedToUserId(emps[0].id);
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !moduleName.trim() || !assignedToUserId || !deadline) {
      setErrorMsg('Please complete all required fields.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');

      const combinedDescription = `${description.trim()}${
        instructions.trim() ? `\n\nInstructions: ${instructions.trim()}` : ''
      }${estimatedHours ? `\nEstimated Effort: ${estimatedHours}h` : ''}`;

      await apiCreateTask({
        title: title.trim(),
        description: combinedDescription,
        moduleName: moduleName.trim(),
        assignedToUserId,
        deadline,
      });

      // Reset
      setTitle('');
      setDescription('');
      setInstructions('');
      onTaskCreated();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to create task.');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseConfirm = () => {
    if (title.trim() || description.trim()) {
      if (!confirm('Discard unsaved task changes?')) return;
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 my-8">
        {/* Header with signature corporate gradient top border */}
        <div className="h-1.5 bg-corporate-gradient w-full" />
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#12345A] text-white flex items-center justify-center shadow-md shadow-[#12345A]/20">
              <Briefcase className="w-5 h-5 text-teal-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#172033]">Create New Operational Task</h3>
              <p className="text-xs text-[#64748B]">Assign milestone deliverables and synchronize with engineering</p>
            </div>
          </div>
          <button
            onClick={handleCloseConfirm}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMsg && (
          <div className="mx-6 mt-4 p-3.5 bg-rose-50 text-rose-800 text-xs rounded-xl flex items-center gap-2 border border-rose-200">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6 text-xs max-h-[75vh] overflow-y-auto">
          {/* Section 1: Task Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100 text-[#12345A] font-bold text-xs uppercase tracking-wider">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>1. Task Information</span>
            </div>

            <div>
              <label className="block font-semibold text-[#172033] mb-1.5">
                Task Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Implement Webhook Signature Verification and Callback Handling"
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600 text-slate-900 font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[#172033] mb-1.5">
                  Target Module / Component <span className="text-rose-500">*</span>
                </label>
                <select
                  value={moduleName}
                  onChange={(e) => setModuleName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white text-slate-900 font-medium"
                >
                  <option value="Payment Gateway">Payment Gateway</option>
                  <option value="Login Module">Login Module</option>
                  <option value="Reporting">Reporting Engine</option>
                  <option value="Dashboard">Dashboard Analytics</option>
                  <option value="UI Enhancement">UI Enhancement</option>
                  <option value="Profile">Profile & Settings</option>
                  <option value="Security Core">Security Core</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-[#172033] mb-1.5">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white text-slate-900 font-medium"
                >
                  <option value="High">High Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="Low">Low Priority</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#172033] mb-1.5">Task Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe scope, functional acceptance criteria, and deliverable format..."
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
              />
            </div>
          </div>

          {/* Section 2: Assignment & Deadlines */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100 text-[#12345A] font-bold text-xs uppercase tracking-wider">
              <UserCheck className="w-4 h-4 text-teal-600" />
              <span>2. Assignment & Schedule</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[#172033] mb-1.5">
                  Assigned Engineer <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={assignedToUserId}
                  onChange={(e) => setAssignedToUserId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white text-slate-900 font-medium"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} ({emp.empId}) — {emp.designation}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-[#64748B] mt-1">
                  Task assignment immediately triggers live dashboard sync and alert notification.
                </p>
              </div>

              <div>
                <label className="block font-semibold text-[#172033] mb-1.5">
                  Committed Deadline <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Effort & Instructions */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-1.5 border-b border-slate-100 text-[#12345A] font-bold text-xs uppercase tracking-wider">
              <Clock className="w-4 h-4 text-blue-600" />
              <span>3. Planning & Instructions</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-[#172033] mb-1.5">Estimated Effort (Hours)</label>
                <input
                  type="number"
                  min="1"
                  max="200"
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-[#172033] mb-1.5">QA Verification Lead</label>
                <input
                  type="text"
                  readOnly
                  value="Sarah Tester (QA / TST001)"
                  className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-[#172033] mb-1.5">Additional Guidelines (Optional)</label>
              <textarea
                rows={2}
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Include branch naming conventions, documentation links, or test fixtures..."
                className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 text-slate-900"
              />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleCloseConfirm}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl bg-corporate-gradient text-white font-bold shadow-md shadow-blue-500/20 hover:opacity-95 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              {loading ? 'Creating Task...' : 'Create & Assign Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
