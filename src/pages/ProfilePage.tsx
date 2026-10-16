import React from 'react';
import { User } from '../types';
import { User as UserIcon, Mail, Building, Briefcase, IndianRupee, ShieldCheck } from 'lucide-react';

interface ProfilePageProps {
  user: User;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({ user }) => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 border-b border-slate-100 pb-6">
          <img
            src={user.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200'}
            alt={user.name}
            className="w-24 h-24 rounded-2xl object-cover border-4 border-blue-100 shadow-md"
          />
          <div className="text-center sm:text-left flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h2 className="text-2xl font-bold text-slate-800">{user.name}</h2>
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-700 w-fit mx-auto sm:mx-0">
                {user.role}
              </span>
            </div>
            <p className="text-sm text-slate-500 font-medium mt-1">
              Employee ID: <span className="font-semibold text-slate-700">{user.empId}</span> • {user.designation}
            </p>
            <p className="text-xs text-slate-400 mt-2">
              Authenticated user session managed with secure PBKDF2 cryptography.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6 text-xs">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
            <Mail className="w-5 h-5 text-blue-600 shrink-0" />
            <div>
              <span className="text-slate-400 font-medium block">Email Address</span>
              <span className="font-semibold text-slate-800 text-sm">{user.email}</span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
            <Building className="w-5 h-5 text-purple-600 shrink-0" />
            <div>
              <span className="text-slate-400 font-medium block">Department</span>
              <span className="font-semibold text-slate-800 text-sm">{user.department}</span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
            <Briefcase className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="text-slate-400 font-medium block">Designation</span>
              <span className="font-semibold text-slate-800 text-sm">{user.designation}</span>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
            <IndianRupee className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <span className="text-slate-400 font-medium block">Configured Hourly Rate</span>
              <span className="font-semibold text-slate-800 text-sm">₹{user.hourlyRate} / hr</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
