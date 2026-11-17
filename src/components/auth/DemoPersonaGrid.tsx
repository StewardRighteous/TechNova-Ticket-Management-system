import React from 'react';
import type { Employee, RoleId } from '../../types/barrel';

interface DemoPersonaGridProps {
  employees: Employee[];
  roles: { id: RoleId; name: string; description: string }[];
  onSelectPersona: (empId: string) => void;
  selectedEmployeeId?: string;
  heading?: string;
}

export const DemoPersonaGrid: React.FC<DemoPersonaGridProps> = ({
  employees,
  roles,
  onSelectPersona,
  selectedEmployeeId,
  heading = 'Choose a demo persona',
}) => {
  return (
    <section className="mt-6 border-t border-slate-200 pt-5" aria-label={heading}>
      <div className="mb-3">
        <h2 className="text-sm font-bold text-slate-900">{heading}</h2>
        <p className="mt-1 text-xs leading-5 text-slate-600">Explore the workspace with a sample account. Each persona has different access.</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {employees.map((emp) => (
          <button
            key={emp.id}
            type="button"
            onClick={() => onSelectPersona(emp.id)}
            aria-pressed={selectedEmployeeId === emp.id}
            className={`flex min-h-20 flex-col rounded-xl border p-3 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${selectedEmployeeId === emp.id ? 'border-indigo-500 bg-indigo-50 ring-1 ring-indigo-500' : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/50'}`}
          >
            <span className="text-sm font-semibold text-slate-900">{emp.name}</span>
            <span className="mt-0.5 text-xs font-semibold text-indigo-700">{roles.find((role) => role.id === emp.role)?.name || emp.roleTitle}</span>
            <span className="mt-1 text-xs leading-4 text-slate-600">{roles.find((role) => role.id === emp.role)?.description || 'Explore the workspace with this role.'}</span>
          </button>
        ))}
      </div>
    </section>
  );
};
