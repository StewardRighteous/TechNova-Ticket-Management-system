import React from 'react';
import type { Employee } from '../../types';

interface DemoPersonaGridProps {
  employees: Employee[];
  onSelectPersona: (empId: string) => void;
}

export const DemoPersonaGrid: React.FC<DemoPersonaGridProps> = ({
  employees,
  onSelectPersona,
}) => {
  return (
    <div className="mt-8 pt-6 border-t border-slate-200">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          One-Click Demo Personas
        </span>
        <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-50 px-2 py-0.5 rounded-full">
          Instant Role Access
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {employees.map((emp) => (
          <button
            key={emp.id}
            type="button"
            onClick={() => onSelectPersona(emp.id)}
            className="p-2.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 bg-slate-50/60 transition-all text-left flex flex-col justify-between group shadow-xs"
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span className="material-symbols-outlined text-[15px] text-slate-400 group-hover:text-indigo-600">
                {emp.avatar}
              </span>
              <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-700 truncate">
                {emp.name.split(' ')[0]}
              </span>
            </div>
            <span className="text-[10px] text-slate-500 group-hover:text-indigo-600 truncate font-medium">
              {emp.roleTitle.split('&')[0]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
