import React, { useEffect, useState } from "react";
import type { Department, Employee, Location, RoleId, ServiceLine, Team, Ticket } from "../../types/barrel";
import { ComboboxFilter } from "../../ui/groups/ComboboxFilter";
import { SelectDropdown } from "../../ui/groups/SelectDropdown";
import { StaffAvatar } from "../../ui/atoms/StaffAvatar";
import { DeleteDialog, DetailBanner, Button, DataTable, Heading, Icon, Input, Label, TableBody, TableCell, TableHead, TableHeader, TableRow, TableSearch } from "../../ui/barrel";
import { EmployeeEditDialog } from "./EmployeeEditDialog";
import { ticketSlaRisk } from "../../utils/supportPolicy";

interface EmployeeDetailHeroProps {
  employee: Employee;
  tickets: Ticket[];
  onUpdateEmployee: (updates: Partial<Employee>) => boolean;
  onDeleteEmployee?: () => void;
  onOpenTicket?: (ticketId: string) => void;
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

type WorkspaceTab = "tickets" | "profile";
type TicketFilter = "status" | "priority" | "service" | "company";
const SectionInfo: React.FC<{ description: string; alignWithHeading?: boolean }> = ({ description, alignWithHeading = false }) => <Button tone="plain" type="button" aria-label={`Section information: ${description}`} className={`group ${alignWithHeading ? "static" : "relative"} ml-auto inline-flex size-6 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500`}>
  <Icon aria-hidden="true" className="text-[17px]">info</Icon>
  <span role="tooltip" className={`pointer-events-none invisible absolute ${alignWithHeading ? "left-0" : "right-0"} top-full z-20 mt-1.5 w-56 rounded-lg bg-slate-900 px-2.5 py-2 text-left text-[11px] font-medium leading-relaxed text-white opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100 group-focus-visible:visible group-focus-visible:opacity-100`}>{description}</span>
</Button>;

export const EmployeeDetailHero: React.FC<EmployeeDetailHeroProps> = ({
  employee,
  tickets,
  onUpdateEmployee,
  onDeleteEmployee,
  onOpenTicket,
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
  const [editingBanner, setEditingBanner] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [profileDraft, setProfileDraft] = useState(employee);
  const [skillsDraft, setSkillsDraft] = useState(employee.skills.join(", "));
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTab>("profile");
  const [ticketSearch, setTicketSearch] = useState("");
  const [ticketFilters, setTicketFilters] = useState<Record<TicketFilter, string[]>>({ status: [], priority: [], service: [], company: [] });
  useEffect(() => { setProfileDraft(employee); setSkillsDraft(employee.skills.join(", ")); }, [employee]);
  const department = departments.find((item) => item.id === employee.departmentId)?.name || "Not assigned";
  const team = teams.find((item) => item.id === employee.teamId)?.name || "Not assigned";
  const location = locations.find((item) => item.id === employee.locationId)?.name || "Remote / distributed";
  const roleName = roles.find((role) => role.id === employee.role)?.name ?? employee.role.replaceAll("_", " ");
  const eligibleServices = (employee.eligibleServiceIds ?? []).map((id) => services.find((service) => service.id === id)?.name ?? id);
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
  const saveProfile = () => {
    const saved = onUpdateEmployee({
      ...(canManageEmployment ? {
        role: profileDraft.role,
        departmentId: profileDraft.departmentId,
        teamId: profileDraft.teamId,
        locationId: profileDraft.locationId,
        supportSchedule: profileDraft.supportSchedule?.trim(),
        eligibleServiceIds: profileDraft.eligibleServiceIds,
        employmentType: profileDraft.employmentType?.trim(),
        hireDate: profileDraft.hireDate?.trim(),
        managerName: profileDraft.managerName?.trim(),
      } : {}),
      timeZone: profileDraft.timeZone?.trim(),
      dateOfBirth: profileDraft.dateOfBirth?.trim(),
      gender: profileDraft.gender?.trim(),
      personalAddress: profileDraft.personalAddress?.trim(),
      emergencyContactName: profileDraft.emergencyContactName?.trim(),
      emergencyContactPhone: profileDraft.emergencyContactPhone?.trim(),
      bankName: profileDraft.bankName?.trim(),
      accountHolderName: profileDraft.accountHolderName?.trim(),
      accountNumber: profileDraft.accountNumber?.trim(),
      routingNumber: profileDraft.routingNumber?.trim(),
      taxId: profileDraft.taxId?.trim(),
      skills: [...new Set(skillsDraft.split(",").map((skill) => skill.trim()).filter(Boolean))],
    });
    if (saved) setEditingProfile(false);
  };
  const profileField = (label: string, key: keyof Employee, value: string, type: "text" | "date" = "text", editable = true) => {
    const isEditable = editingProfile && editable;
    return <Label variant="plain" key={label} className="block text-xs font-semibold text-slate-500">{label}<Input appearance="plain" type={type} aria-label={label} readOnly={!isEditable} value={value} onChange={(event) => setProfileDraft({ ...profileDraft, [key]: event.target.value })} className={`mt-1 block min-h-10 w-full rounded-md border px-3 py-2 text-sm font-normal text-slate-900 outline-none ${isEditable ? "border-slate-300 bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-100" : "border-slate-200 bg-slate-50"}`} /></Label>;
  };

  return (
    <div className="space-y-3.5">
      <DetailBanner
        title={employee.name}
        status={displayedStatus}
        statusTone={displayedStatus === "Available" ? "positive" : displayedStatus === "Busy" ? "warning" : "neutral"}
        subtitle={employee.roleTitle}
        icon={<StaffAvatar src={employee.avatar} alt="" sizeClassName="size-12" fallbackClassName="text-[23px]" />}
        metrics={[
          ["Work email", employee.email, "mail"],
          ["Work phone", employee.phone || "—", "call"],
          ["Team", team, "groups"],
          ["Active tickets", `${tickets.length} / ${employee.capacityMax}`, "confirmation_number"],
        ]}
        actions={<>
          {canEdit && <>
            <Button type="button" tone="inverse" size="small" onClick={() => setEditingBanner(true)}>Edit details</Button>
            <Button type="button" tone="inverse" size="small" onClick={() => onUpdateEmployee({ status: employee.status === "Off Shift" ? "Available" : "Off Shift" })}>
              {employee.status === "Off Shift" ? "Set active" : "Set off shift"}
            </Button>
          </>}
          {onDeleteEmployee && <Button type="button" tone="inverseDanger" size="small" onClick={() => setDeleteDialogOpen(true)}>Delete employee</Button>}
          {!profileOnly && <Button type="button" tone="primary" size="small" onClick={() => setWorkspaceTab("tickets")}>View ticket activity</Button>}
        </>}
      />

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {!profileOnly && <div role="tablist" aria-label="Employee workspace" className="flex border-b border-slate-200 px-3 sm:px-4">
          {([ ["profile", "Profile & Skills"], ["tickets", "Assigned Tickets"] ] as [WorkspaceTab, string][]).map(([tab, label]) => (
            <Button tone="plain" key={tab} type="button" role="tab" aria-selected={workspaceTab === tab} onClick={() => setWorkspaceTab(tab)} className={`border-b-2 px-3 py-3 text-xs font-bold transition-colors sm:px-4 ${workspaceTab === tab ? "border-teal-600 text-teal-700" : "border-transparent text-slate-500 hover:text-slate-800"}`}>{label}</Button>
          ))}
        </div>}

        {workspaceTab === "tickets" ? <div className="p-4 sm:p-5">
          <div className="relative flex w-fit items-center gap-2"><Heading>{visibleTickets.length} of {tickets.length} active {tickets.length === 1 ? "ticket" : "tickets"}</Heading><SectionInfo alignWithHeading description="Tickets currently assigned to this employee, with their status, priority, service, and SLA." /></div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
            <TableSearch id="employee-ticket-search" value={ticketSearch} onChange={setTicketSearch} placeholder="Search tickets..." aria-label="Search assigned tickets" compact className="max-w-72" />
            <div className="flex flex-wrap items-center gap-2">
            {([ ["status", "Status"], ["priority", "Priority"], ["service", "Service"], ["company", "Company"] ] as [TicketFilter, string][]).map(([key, label]) => <ComboboxFilter key={key} label={label} options={filterOptions[key]} selectedValues={ticketFilters[key]} onChange={(values) => setTicketFilters((current) => ({ ...current, [key]: values }))} singleSelect placeholder={`Filter by ${label.toLowerCase()}`} />)}
            {Object.values(ticketFilters).some((values) => values.length > 0) && <Button tone="plain" type="button" onClick={() => setTicketFilters({ status: [], priority: [], service: [], company: [] })} className="mb-0.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100">Clear filters</Button>}
            </div>
          </div>
          <div className="mt-3 overflow-x-auto">
            <DataTable className="min-w-[850px]"><TableHead tone="plain" className="border-b border-slate-200 text-[10px] font-bold tracking-wide text-slate-500 uppercase"><TableRow><TableHeader density="plain" className="pb-2 pr-3">Ticket</TableHeader><TableHeader density="plain" className="pb-2 pr-3">Subject</TableHeader><TableHeader density="plain" className="pb-2 pr-3">Company</TableHeader><TableHeader density="plain" className="pb-2 pr-3">Service</TableHeader><TableHeader density="plain" className="pb-2 pr-3">Status</TableHeader><TableHeader density="plain" className="pb-2 pr-3">Priority</TableHeader><TableHeader density="plain" className="pb-2">SLA</TableHeader></TableRow></TableHead>
              <TableBody>{visibleTickets.map((ticket) => <TableRow key={ticket.id}>
                <TableCell density="plain" className="py-2.5 pr-3"><Button tone="plain" type="button" onClick={() => onOpenTicket?.(ticket.id)} className="font-bold text-teal-700 hover:underline">{ticket.code}</Button></TableCell>
                <TableCell density="plain" className="max-w-sm py-2.5 pr-3 text-slate-800">{ticket.title}</TableCell>
                <TableCell density="plain" className="max-w-[180px] truncate py-2.5 pr-3 text-slate-600">{ticket.companyName}</TableCell>
                <TableCell density="plain" className="max-w-[160px] truncate py-2.5 pr-3 text-slate-600">{ticket.serviceName}</TableCell>
                <TableCell density="plain" className="py-2.5 pr-3 text-slate-600">{ticket.status}</TableCell>
                <TableCell density="plain" className="py-2.5 pr-3 text-slate-600">{ticket.priority}</TableCell>
                <TableCell density="plain" className="py-2.5 text-slate-600">{ticketSlaRisk(ticket)}</TableCell>
              </TableRow>)}
                {!visibleTickets.length && <TableRow><TableCell density="plain" colSpan={7} className="py-8 text-center text-xs text-slate-500">{tickets.length ? "No tickets match your search or filters." : "No active assigned tickets."}</TableCell></TableRow>}
              </TableBody>
            </DataTable>
          </div>
        </div> : <div className="p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <Heading>{profileOnly ? "Profile details" : "Employee details"}</Heading>
            {canEdit && (editingProfile ? <div className="flex gap-2"><Button size="small" type="button" onClick={() => { setProfileDraft(employee); setSkillsDraft(employee.skills.join(", ")); setEditingProfile(false); }}>Cancel</Button><Button tone="primary" size="small" type="button" onClick={saveProfile}>Save</Button></div> : <Button tone="plain" type="button" onClick={() => { setProfileDraft(employee); setSkillsDraft(employee.skills.join(", ")); setEditingProfile(true); }} className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold">Edit</Button>)}
          </div>
          <div className="space-y-5">
            <section><Heading as="h3" variant="plain" className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Personal details</Heading><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{profileField("Date of birth", "dateOfBirth", profileDraft.dateOfBirth ?? "", "date")}{profileField("Gender", "gender", profileDraft.gender ?? "")}{profileField("Personal address", "personalAddress", profileDraft.personalAddress ?? "")}</div></section>
            <section className="border-t border-slate-100 pt-4"><Heading as="h3" variant="plain" className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Employment and support</Heading><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{editingProfile && canManageEmployment ? <>
              <Label variant="plain" className="block text-xs font-semibold text-slate-500">Support role<span className="mt-1 block"><SelectDropdown label="Support role" options={roles.map(({ id, name }) => ({ value: id, label: name }))} value={profileDraft.role} onChange={(value) => setProfileDraft({ ...profileDraft, role: value as RoleId })} /></span></Label>
              <Label variant="plain" className="block text-xs font-semibold text-slate-500">Department<span className="mt-1 block"><SelectDropdown label="Department" options={departments.map(({ id, name }) => ({ value: id, label: name }))} value={profileDraft.departmentId ?? ""} onChange={(value) => setProfileDraft({ ...profileDraft, departmentId: value })} placeholder="Select a department" /></span></Label>
              <Label variant="plain" className="block text-xs font-semibold text-slate-500">Team<span className="mt-1 block"><SelectDropdown label="Team" options={teams.map(({ id, name }) => ({ value: id, label: name }))} value={profileDraft.teamId ?? ""} onChange={(value) => setProfileDraft({ ...profileDraft, teamId: value })} placeholder="Select a team" /></span></Label>
              <Label variant="plain" className="block text-xs font-semibold text-slate-500">Work location<span className="mt-1 block"><SelectDropdown label="Work location" options={locations.map(({ id, name }) => ({ value: id, label: name }))} value={profileDraft.locationId ?? ""} onChange={(value) => setProfileDraft({ ...profileDraft, locationId: value })} placeholder="Select a location" /></span></Label>
            </> : <>{profileField("Support role", "roleTitle", roleName, "text", false)}{profileField("Department", "departmentId", department, "text", false)}{!profileOnly && profileField("Team", "teamId", team, "text", false)}{profileField("Work location", "locationId", location, "text", false)}</>}
              {profileField("Employment type", "employmentType", profileDraft.employmentType ?? "", "text", canManageEmployment)}{profileField("Hire date", "hireDate", profileDraft.hireDate ?? "", "date", canManageEmployment)}{profileField("Manager", "managerName", profileDraft.managerName ?? "", "text", canManageEmployment)}{profileField("Time zone", "timeZone", profileDraft.timeZone ?? "")}{profileField("Shift or on-call schedule", "supportSchedule", profileDraft.supportSchedule ?? "", "text", canManageEmployment)}
              {editingProfile && canManageEmployment ? <div><ComboboxFilter label="Eligible services" options={services.map(({ id, name }) => ({ value: id, label: name }))} selectedValues={profileDraft.eligibleServiceIds ?? []} onChange={(eligibleServiceIds) => setProfileDraft({ ...profileDraft, eligibleServiceIds })} placeholder="Any service" /></div> : !profileOnly && profileField("Eligible services", "roleTitle", eligibleServices.join(", ") || "Any service", "text", false)}
              {editingProfile ? <Label variant="plain" className="block text-xs font-semibold text-slate-500">Skills<Input appearance="plain" value={skillsDraft} onChange={(event) => setSkillsDraft(event.target.value)} className="mt-1 block min-h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-900" /></Label> : profileField("Skills", "roleTitle", employee.skills.join(", "))}</div></section>
            <section className="border-t border-slate-100 pt-4"><Heading as="h3" variant="plain" className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Emergency contact</Heading><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{profileField("Contact name", "emergencyContactName", profileDraft.emergencyContactName ?? "")}{profileField("Contact phone", "emergencyContactPhone", profileDraft.emergencyContactPhone ?? "")}</div></section>
            <section className="border-t border-slate-100 pt-4"><Heading as="h3" variant="plain" className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Bank and tax details</Heading><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{profileField("Bank name", "bankName", profileDraft.bankName ?? "")}{profileField("Account holder", "accountHolderName", profileDraft.accountHolderName ?? "")}{profileField("Account number", "accountNumber", profileDraft.accountNumber ?? "")}{profileField("Routing number", "routingNumber", profileDraft.routingNumber ?? "")}{profileField("Tax ID", "taxId", profileDraft.taxId ?? "")}</div></section>
          </div>
        </div>}
      </section>
      {editingBanner && <EmployeeEditDialog employee={employee} teams={teams} canManageEmployment={canManageEmployment} onCancel={() => setEditingBanner(false)} onSave={(updates) => {
        if (onUpdateEmployee(updates)) setEditingBanner(false);
      }} />}
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
