import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTicketStore } from "../../store/barrel";
import { EmployeeTable } from "./EmployeeTable";
import { EmployeeDetailHero } from "./EmployeeDetailHero";
import { filterEmployeesByRole } from "../../utils/barrel";
import { Breadcrumb } from "../common/barrel";

export const EmployeesView: React.FC = () => {
  const { data, activeRole, updateEmployee, addToast } = useTicketStore();
  const navigate = useNavigate();
  const { employeeId: activeEmployeeId } = useParams<{ employeeId: string }>();

  const roleEmployees = filterEmployeesByRole(data.employees, activeRole);
  const selectedEmployee =
    roleEmployees.find((e) => e.id === activeEmployeeId) ||
    data.employees.find((e) => e.id === activeEmployeeId);

  const handleUpdateEmployee = (
    updates: Partial<import("../../types/barrel").Employee>,
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
            onBack={() => navigate("/employees")}
          />
          <EmployeeDetailHero
            employee={selectedEmployee}
            tickets={data.tickets}
            onBack={() => navigate("/employees")}
            onUpdateEmployee={handleUpdateEmployee}
            onOpenTicket={(ticketId) => navigate(`/tickets/${encodeURIComponent(ticketId)}`)}
          />
        </>
      ) : (
        <EmployeeTable
          employees={roleEmployees}
          activeRoleId={activeRole}
          onViewEmployee={(id) => navigate(`/employees/${encodeURIComponent(id)}`)}
        />
      )}
    </div>
  );
};
