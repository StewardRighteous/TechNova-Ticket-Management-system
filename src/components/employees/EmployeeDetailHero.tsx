import React, { useState } from "react";
import type { Department, Employee, Location, RoleId, ServiceLine, Team, Ticket } from "../../types/barrel";
import { ClearTableFiltersButton, DeleteDialog, DetailBanner, Button, ComboboxFilter, StaffAvatar, TableSearch } from "../../ui/barrel";
import { EmployeeGeneralForm } from "./EmployeeGeneralForm";
import { EmployeeProfileForm } from "./EmployeeProfileForm";
import { RelatedTicketsTable } from "../shared/RelatedTicketsTable";

interface EmployeeDetailHeroProps {
  employee: Employee;
  tickets: Ticket[];
  onUpdateEmployee: (updates: Partial<Employee>) => boolean;
  onDeleteEmployee?: () => void;
  teams?: Team[];
  departments?: Department[];
  locations?: Location[];
  roles?: { id: RoleId; name: string }[];
  services?: ServiceLine[];
  canEdit?: boolean;
  canManageEmployment?: boolean;
  profileOnly?: boolean;
  isCurrentUser?: boolean;
}

type WorkspaceTab = "general" | "tickets" | "profile";
type TicketFilter = "status" | "priority" | "service" | "company";

export const EmployeeDetailHero: React.FC<EmployeeDetailHeroProps> = ({
  employee,
  tickets,
  onUpdateEmployee,
  onDeleteEmployee,
  teams = [],
  departments = [],
  locations = [],
  roles = [],
  services = [],
  canEdit = false,
  canManageEmployment = false,
  profileOnly = false,
  isCurrentUser = false,
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTab>("general");
  const tabs: [WorkspaceTab, string][] = [["general", "General"], ["profile", "Employee details"]];
  if (!profileOnly) tabs.push(["tickets", `Assigned Tickets (${tickets.length})`]);
  const [ticketSearch, setTicketSearch] = useState("");
  const [ticketFilters, setTicketFilters] = useState<Record<TicketFilter, string[]>>({ status: [], priority: [], service: [], company: [] });
  const team = teams.find((item) => item.id === employee.teamId)?.name || "Not assigned";
  const activeTicketCount = tickets.filter((ticket) => ticket.status !== "Resolved" && ticket.status !== "Closed").length;
  const displayedStatus: Employee["status"] = employee.status === "Off Shift"
    ? "Off Shift"
    : activeTicketCount >= employee.capacityMax ? "Busy" : "Available";
  const filterOptions: Record<TicketFilter, { value: string; label: string }[]> = {
    status: [...new Set(tickets.map((ticket) => ticket.status))].sort().map((value) => ({ value, label: value })),
    priority: [...new Set(tickets.map((ticket) => ticket.priority))].sort().map((value) => ({ value, label: value })),
    service: [...new Set(tickets.map((ticket) => ticket.serviceName))].sort().map((value) => ({ value, label: value })),
    company: [...new Set(tickets.map((ticket) => ticket.companyName))].sort().map((value) => ({ value, label: value })),
  };
  const query = ticketSearch.trim().toLowerCase();
  const visibleTickets = tickets.filter((ticket) =>
    (!query || [ticket.code, ticket.title, ticket.companyName, ticket.serviceName].some((value) => value.toLowerCase().includes(query))) &&
    (!ticketFilters.status.length || ticketFilters.status.includes(ticket.status)) &&
    (!ticketFilters.priority.length || ticketFilters.priority.includes(ticket.priority)) &&
    (!ticketFilters.service.length || ticketFilters.service.includes(ticket.serviceName)) &&
    (!ticketFilters.company.length || ticketFilters.company.includes(ticket.companyName))
  );

  return (
    <div className="space-y-3.5">
      <DetailBanner
        title={employee.name}
        status={displayedStatus}
        statusTone={displayedStatus === "Available" ? "positive" : displayedStatus === "Busy" ? "warning" : "neutral"}
        subtitle={employee.roleTitle}
        icon={<StaffAvatar src={employee.avatar} alt="" sizeClassName="size-12" fallbackClassName="text-[23px]" />}
        iconAppearance="plain"
        metrics={[
          ["Work email", employee.email, "mail"],
          ["Work phone", employee.phone || "N/A", "call"],
          ["Team", team, "groups"],
          ["Active tickets", `${tickets.length} / ${employee.capacityMax}`, "confirmation_number"],
        ]}
        actions={<>
          {canEdit &&
            <Button type="button" tone="inverse" size="small" onClick={() => onUpdateEmployee({ status: employee.status === "Off Shift" ? "Available" : "Off Shift" })}>
              {employee.status === "Off Shift" ? "Set active" : "Set off shift"}
            </Button>
          }
          {onDeleteEmployee && <Button type="button" tone="inverseDanger" size="small" onClick={() => setDeleteDialogOpen(true)}>Delete employee</Button>}
          {!profileOnly && <Button type="button" tone="primary" size="small" onClick={() => setWorkspaceTab("tickets")}>View ticket activity</Button>}
        </>}
      />

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-3 pt-1.5">
          <div role="tablist" aria-label="Employee workspace" className="flex min-w-0 gap-1 overflow-x-auto">
            {tabs.map(([tab, label]) => (
              <Button tone="plain" key={tab} type="button" role="tab" aria-selected={workspaceTab === tab} onClick={() => setWorkspaceTab(tab)} className={`whitespace-nowrap border-b-2 px-3 py-2.5 text-xs font-bold ${workspaceTab === tab ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-500 hover:text-slate-800"}`}>{label}</Button>
            ))}
          </div>
        </div>

        <div hidden={workspaceTab !== "general"} role="tabpanel" className="p-3 sm:p-4">
          <EmployeeGeneralForm employee={employee} teams={teams} canEdit={canEdit} canManageEmployment={canManageEmployment} onSave={onUpdateEmployee} />
        </div>
        {workspaceTab === "tickets" && <div className="p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <TableSearch id="employee-ticket-search" value={ticketSearch} onChange={setTicketSearch} placeholder="Search tickets..." aria-label="Search assigned tickets" compact className="max-w-72" />
            <div className="flex flex-wrap items-center gap-2">
            {([ ["status", "Status"], ["priority", "Priority"], ["service", "Service"], ["company", "Company"] ] as [TicketFilter, string][]).map(([key, label]) => <ComboboxFilter hideClear key={key} label={label} options={filterOptions[key]} selectedValues={ticketFilters[key]} onChange={(values) => setTicketFilters((current) => ({ ...current, [key]: values }))} singleSelect placeholder={`Filter by ${label.toLowerCase()}`} />)}
            {Object.values(ticketFilters).some((values) => values.length > 0) && <ClearTableFiltersButton onClear={() => setTicketFilters({ status: [], priority: [], service: [], company: [] })} />}
            </div>
          </div>
          <div className="mt-3">
            <RelatedTicketsTable tickets={visibleTickets} emptyMessage={tickets.length ? "No tickets match your search or filters." : "No active assigned tickets."} />
          </div>
        </div>}
        <div hidden={workspaceTab !== "profile"} role="tabpanel" className="p-3 sm:p-4">
          <EmployeeProfileForm
            employee={employee}
            departments={departments}
            teams={teams}
            locations={locations}
            roles={roles}
            services={services}
            canEdit={canEdit}
            canManageEmployment={canManageEmployment}
            profileOnly={profileOnly}
            onSave={onUpdateEmployee}
          />
        </div>
      </section>
      {deleteDialogOpen && onDeleteEmployee && <DeleteDialog
        title={`Remove ${employee.name}?`}
        description={`Permanent deletion leaves ticket history intact and unassigns active tickets.${isCurrentUser ? " The active account cannot be permanently deleted while signed in." : ""}`}
        verification={employee.name}
        deleteDisabled={isCurrentUser}
        onCancel={() => setDeleteDialogOpen(false)}
        onDelete={onDeleteEmployee}
        alternative={{
          title: "Mark unavailable",
          description: "Keep the account and records while preventing new ticket assignments.",
          onClick: () => { onUpdateEmployee({ status: "Off Shift" }); setDeleteDialogOpen(false); },
        }}
      />}
    </div>
  );
};
