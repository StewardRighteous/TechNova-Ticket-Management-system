import React from 'react';
import type { Employee } from '../../types';

interface EmployeeCardProps {
  employee: Employee;
  isCurrentRole: boolean;
}

export const EmployeeCard: React.FC<EmployeeCardProps> = ({ employee, isCurrentRole }) => {
  const capacityPct = Math.round((employee.activeTicketsCount / employee.capacityMax) * 100);

  return (
    <div
      className={`bg-white rounded-2xl border p-6 shadow-sm transition-all flex flex-col justify-between ${
        isCurrentRole
          ? 'border-indigo-400 ring-2 ring-indigo-200 shadow-md'
          : 'border-slate-200 hover:border-slate-300'
      }`}
    >
      <div>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm shadow">
              <span className="material-symbols-outlined text-[20px]">{employee.avatar}</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm font-bold text-slate-900">{employee.name}</h3>
                {isCurrentRole && (
                  <span className="text-[9px] bg-indigo-600 text-white font-bold px-1.5 py-0.2 rounded">
                    YOU
                  </span>
                )}
              </div>
              <span className="text-xs font-semibold text-indigo-600">{employee.roleTitle}</span>
            </div>
          </div>
          <span
            className={`text-xs px-2.5 py-0.5 rounded-full font-semibold ${
              employee.status === 'Available'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}
          >
            {employee.status}
          </span>
        </div>

        {/* Contact details */}
        <div className="mt-4 space-y-1 text-xs text-slate-600">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Email:</span>
            <span className="font-mono text-slate-700 text-[11px]">{employee.email}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Direct Ext:</span>
            <span className="font-mono text-slate-700 text-[11px]">{employee.phone}</span>
          </div>
        </div>

        {/* Skills */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
            Key Competencies
          </span>
          <div className="flex flex-wrap gap-1.5">
            {employee.skills.map((skill, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                {skill}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Workload Capacity Bar */}
      <div className="mt-5 pt-3 border-t border-slate-100">
        <div className="flex justify-between items-center text-xs mb-1">
          <span className="text-slate-500 font-medium">Workload Gauge</span>
          <span className="font-bold text-slate-800 font-mono">
            {employee.activeTicketsCount} / {employee.capacityMax} ({capacityPct}%)
          </span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              capacityPct > 85 ? 'bg-red-500' : capacityPct > 65 ? 'bg-indigo-600' : 'bg-emerald-500'
            }`}
            style={{ width: `${capacityPct}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};
