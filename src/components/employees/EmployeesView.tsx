import React from 'react';
import { useTicketStore } from '../../store';
import { EmployeeCard } from './EmployeeCard';

export const EmployeesView: React.FC = () => {
  const { data, activeRole, searchQuery } = useTicketStore();

  const filteredEmployees = data.employees.filter((e) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      e.name.toLowerCase().includes(q) ||
      e.roleTitle.toLowerCase().includes(q) ||
      e.email.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Engineering & Operations Roster</h1>
          <p className="text-xs text-slate-500">
            Internal dispatch team covering Support, Senior Support, Dev, QA, and Account Management
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700">
            {filteredEmployees.length} Active Engineers & Specialists
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {filteredEmployees.map((emp) => (
          <EmployeeCard
            key={emp.id}
            employee={emp}
            isCurrentRole={emp.role === activeRole}
          />
        ))}
      </div>
    </div>
  );
};
