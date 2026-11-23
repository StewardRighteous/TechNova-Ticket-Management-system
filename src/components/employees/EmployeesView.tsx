import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTicketStore } from "../../store/barrel";
import { EmployeeTable } from "./EmployeeTable";
import { EmployeeDetailHero } from "./EmployeeDetailHero";
import { filterEmployeesByRole, filterTicketsByRole, ROLE_PERMISSIONS } from "../../utils/barrel";

export const EmployeesView: React.FC = () => {
  const { data, activeRole, currentUser, updateEmployee, deleteEmployee, addToast } = useTicketStore();
  const navigate = useNavigate();
  const { employeeId: activeEmployeeId } = useParams<{ employeeId: string }>();

  const roleEmployees = filterEmployeesByRole(data.employees, activeRole);
  const roleTickets = filterTicketsByRole(data.tickets, activeRole, currentUser?.id);
  const selectedEmployee = roleEmployees.find((e) => e.id === activeEmployeeId);

  const handleUpdateEmployee = (
    updates: Partial<import("../../types/barrel").Employee>,
  ) => {
    if (activeEmployeeId) { updateEmployee(activeEmployeeId, updates); addToast("Employee changes saved", "success"); }
  };

  const handleDeleteEmployee = () => {
    if (!activeEmployeeId) return;
    deleteEmployee(activeEmployeeId);
    addToast("Employee deleted and active tickets unassigned.", "success");
    navigate("/employees");
  };

  return (
    <div className="space-y-4 p-2">
      {activeEmployeeId && !selectedEmployee ? (
        <section role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-6">
          <h1 className="text-lg font-semibold text-slate-900">Employee unavailable</h1>
          <p className="mt-2 text-sm text-slate-700">This employee may not exist or may not be available to your role.</p>
          <button type="button" onClick={() => navigate("/employees")} className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">Return to employees</button>
        </section>
      ) : <>
        {selectedEmployee && <>
          <EmployeeDetailHero
            key={selectedEmployee.id}
            employee={selectedEmployee}
            tickets={roleTickets.filter((ticket) => ticket.assignedToId === selectedEmployee?.id && !["Resolved", "Closed"].includes(ticket.status))}
            teams={data.teams}
            departments={data.departments}
            locations={data.locations}
            roles={data.roles}
            services={data.services}
            canEdit={ROLE_PERMISSIONS[activeRole].canManageTeam}
            isCurrentUser={selectedEmployee.id === currentUser?.id}
            onUpdateEmployee={handleUpdateEmployee}
            onDeleteEmployee={handleDeleteEmployee}
            onOpenTicket={(ticketId) => navigate(`/tickets/${encodeURIComponent(ticketId)}`)}
          />
        </>}
        <div hidden={Boolean(activeEmployeeId)}><EmployeeTable
          employees={roleEmployees}
          activeRoleId={activeRole}
          onViewEmployee={(id) => navigate(`/employees/${encodeURIComponent(id)}`)}
          onCreateNew={activeRole === "operations_manager" || activeRole === "management" ? () => navigate("/employees/new") : undefined}
        /></div>
      </>}
    </div>
  );
};
