import React, { useState } from 'react';
import { useTicketStore } from '../../store';
import { EmployeeTable } from './EmployeeTable';
import { EmployeeDetailHero } from './EmployeeDetailHero';
import { filterEmployeesByRole } from '../../utils';
import type { Employee } from '../../types';

export const EmployeesView: React.FC = () => {
  const { data, activeRole } = useTicketStore();
  const [activeEmployeeId, setActiveEmployeeId] = useState<string | null>(null);

  const roleEmployees = filterEmployeesByRole(data.employees, activeRole);
  const selectedEmployee = roleEmployees.find((e) => e.id === activeEmployeeId) || data.employees.find((e) => e.id === activeEmployeeId);

  const handleUpdateEmployee = (updates: Partial<Employee>) => {
    if (!activeEmployeeId) return;
    const updated = data.employees.map((e) => {
      if (e.id === activeEmployeeId) {
        return { ...e, ...updates };
      }
      return e;
    });
    useTicketStore.setState({
      data: { ...data, employees: updated }
    });
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      {selectedEmployee ? (
        <EmployeeDetailHero
          employee={selectedEmployee}
          onBack={() => setActiveEmployeeId(null)}
          onUpdateEmployee={handleUpdateEmployee}
        />
      ) : (
        <EmployeeTable
          employees={roleEmployees}
          activeRoleId={activeRole}
          onViewEmployee={(id) => setActiveEmployeeId(id)}
        />
      )}
    </div>
  );
};
