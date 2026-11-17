import React, { useState } from "react";
import { useTicketStore } from "../../store";
import { EmployeeTable } from "./EmployeeTable";
import { EmployeeDetailHero } from "./EmployeeDetailHero";
import { filterEmployeesByRole } from "../../utils";
import { Breadcrumb } from "../common";

export const EmployeesView: React.FC = () => {
  const { data, activeRole, updateEmployee, addToast, setActiveTab, setSelectedTicketId } = useTicketStore();
  const [activeEmployeeId, setActiveEmployeeId] = useState<string | null>(null);

  const roleEmployees = filterEmployeesByRole(data.employees, activeRole);
  const selectedEmployee =
    roleEmployees.find((e) => e.id === activeEmployeeId) ||
    data.employees.find((e) => e.id === activeEmployeeId);

  const handleUpdateEmployee = (
    updates: Partial<import("../../types").Employee>,
  ) => {
    if (activeEmployeeId) { updateEmployee(activeEmployeeId, updates); addToast("Employee changes saved", "success"); }
  };

  return (
    <div className="space-y-4 p-2">
      {selectedEmployee ? (
        <>
          <Breadcrumb
            section="Employees"
            current={selectedEmployee.name}
            onBack={() => setActiveEmployeeId(null)}
          />
          <EmployeeDetailHero
            employee={selectedEmployee}
            tickets={data.tickets}
            onBack={() => setActiveEmployeeId(null)}
            onUpdateEmployee={handleUpdateEmployee}
            onOpenTicket={(ticketId) => { setSelectedTicketId(ticketId); setActiveTab("tickets"); }}
          />
        </>
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
