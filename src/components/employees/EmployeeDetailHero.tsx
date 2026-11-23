import React, { useEffect, useState } from "react";
import type { Department, Employee, Location, RoleId, ServiceLine, Team, Ticket } from "../../types/barrel";
import { ComboboxFilter } from "../common/ComboboxFilter";
import { SelectDropdown } from "../common/SelectDropdown";
import { StaffAvatar } from "../common/StaffAvatar";
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
const SectionInfo: React.FC<{ description: string; alignWithHeading?: boolean }> = ({ description, alignWithHeading = false }) => <button type="button" aria-label={`Section information: ${description}`} className={`group ${alignWithHeading ? "static" : "relative"} ml-auto inline-flex size-6 shrink-0 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500`}>
  <span aria-hidden="true" className="material-symbols-outlined text-[17px]">info</span>
  <span role="tooltip" className={`pointer-events-none invisible absolute ${alignWithHeading ? "left-0" : "right-0"} top-full z-20 mt-1.5 w-56 rounded-lg bg-slate-900 px-2.5 py-2 text-left text-[11px] font-medium leading-relaxed text-white opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100 group-focus-visible:visible group-focus-visible:opacity-100`}>{description}</span>
</button>;

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
  const [deleteConfirmation, setDeleteConfirmation] = useState("");
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTab>("profile");
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
  const visibleTickets = tickets.filter((ticket) =>
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
    return <label key={label} className="block text-xs font-semibold text-slate-500">{label}<input type={type} aria-label={label} readOnly={!isEditable} value={value} onChange={(event) => setProfileDraft({ ...profileDraft, [key]: event.target.value })} className={`mt-1 block min-h-10 w-full rounded-md border px-3 py-2 text-sm font-normal text-slate-900 outline-none ${isEditable ? "border-slate-300 bg-white focus:border-teal-600 focus:ring-2 focus:ring-teal-100" : "border-slate-200 bg-slate-50"}`} /></label>;
  };

  return (
    <div className="space-y-3.5">
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-slate-900 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3 px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white p-0.5 text-teal-800 ring-2 ring-teal-200/60"><StaffAvatar src={employee.avatar} alt={`${employee.name} profile`} sizeClassName="h-11 w-11" fallbackClassName="text-[23px]" /></span>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <h1 className="truncate text-lg font-bold text-white">{employee.name}</h1>
                <span className={`rounded-full px-2 py-0.5 font-semibold ${displayedStatus === "Available" ? "bg-teal-400/20 text-teal-100" : displayedStatus === "Busy" ? "bg-amber-300/20 text-amber-100" : "bg-white/15 text-slate-200"}`}>{displayedStatus}</span>
              </div>
              <p className="mt-1 text-xs text-slate-200">{employee.roleTitle}</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-end gap-2 self-center">
            {canEdit && <>
              <button type="button" onClick={() => setEditingBanner(true)} className="rounded-lg border border-white/30 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10">Edit details</button>
              <button type="button" onClick={() => onUpdateEmployee({ status: employee.status === "Off Shift" ? "Available" : "Off Shift" })} className={`rounded-lg border px-3 py-2 text-xs font-semibold ${employee.status === "Off Shift" ? "border-teal-200/50 text-teal-100 hover:bg-teal-500/20" : "border-white/30 text-white hover:bg-white/10"}`}>{employee.status === "Off Shift" ? "Set active" : "Set off shift"}</button>
            </>}
            {onDeleteEmployee && <button type="button" onClick={() => { setDeleteConfirmation(""); setDeleteDialogOpen(true); }} className="rounded-lg border border-red-300/50 px-3 py-2 text-xs font-semibold text-red-100 hover:bg-red-500/20">Delete employee</button>}
            {!profileOnly && <button type="button" onClick={() => setWorkspaceTab("tickets")} className="shrink-0 rounded-lg bg-teal-500 px-3 py-2 text-xs font-semibold text-white hover:bg-teal-600">View ticket activity</button>}
          </div>
        </div>
        <div className="grid grid-cols-2 border-t border-white/15 sm:grid-cols-4">
          {[
            ["Work email", employee.email, "mail"],
            ["Work phone", employee.phone || "—", "call"],
            ["Team", team, "groups"],
            ["Active tickets", `${tickets.length} / ${employee.capacityMax}`, "confirmation_number"],
          ].map(([label, value, icon]) => (
            <div key={label} className="flex min-w-0 items-center gap-2 border-r border-white/10 px-3 py-2.5 last:border-r-0 sm:px-4">
              <span className="material-symbols-outlined text-[17px] text-teal-200">{icon}</span>
              <div className="min-w-0"><p className="text-[10px] text-slate-300">{label}</p><p className="truncate text-xs font-semibold text-white">{value}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        {!profileOnly && <div role="tablist" aria-label="Employee workspace" className="flex border-b border-slate-200 px-3 sm:px-4">
          {([ ["profile", "Profile & Skills"], ["tickets", "Assigned Tickets"] ] as [WorkspaceTab, string][]).map(([tab, label]) => (
            <button key={tab} type="button" role="tab" aria-selected={workspaceTab === tab} onClick={() => setWorkspaceTab(tab)} className={`border-b-2 px-3 py-3 text-xs font-bold transition-colors sm:px-4 ${workspaceTab === tab ? "border-teal-600 text-teal-700" : "border-transparent text-slate-500 hover:text-slate-800"}`}>{label}</button>
          ))}
        </div>}

        {workspaceTab === "tickets" ? <div className="p-4 sm:p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div className="relative flex items-center gap-2"><h2 className="text-base font-bold text-slate-900">{visibleTickets.length} of {tickets.length} active {tickets.length === 1 ? "ticket" : "tickets"}</h2><SectionInfo alignWithHeading description="Tickets currently assigned to this employee, with their status, priority, service, and SLA." /></div>
            <div className="flex flex-wrap items-end justify-end gap-2">
            {([ ["status", "Status"], ["priority", "Priority"], ["service", "Service"], ["company", "Company"] ] as [TicketFilter, string][]).map(([key, label]) => <ComboboxFilter key={key} label={label} options={filterOptions[key]} selectedValues={ticketFilters[key]} onChange={(values) => setTicketFilters((current) => ({ ...current, [key]: values }))} singleSelect placeholder={`Filter by ${label.toLowerCase()}`} />)}
            {Object.values(ticketFilters).some((values) => values.length > 0) && <button type="button" onClick={() => setTicketFilters({ status: [], priority: [], service: [], company: [] })} className="mb-0.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100">Clear filters</button>}
            </div>
          </div>
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[850px] text-left text-xs"><thead className="border-b border-slate-200 text-[10px] font-bold tracking-wide text-slate-500 uppercase"><tr><th className="pb-2 pr-3">Ticket</th><th className="pb-2 pr-3">Subject</th><th className="pb-2 pr-3">Company</th><th className="pb-2 pr-3">Service</th><th className="pb-2 pr-3">Status</th><th className="pb-2 pr-3">Priority</th><th className="pb-2">SLA</th></tr></thead>
              <tbody className="divide-y divide-slate-100">{visibleTickets.map((ticket) => <tr key={ticket.id}>
                <td className="py-2.5 pr-3"><button type="button" onClick={() => onOpenTicket?.(ticket.id)} className="font-bold text-teal-700 hover:underline">{ticket.code}</button></td>
                <td className="max-w-sm py-2.5 pr-3 text-slate-800">{ticket.title}</td>
                <td className="max-w-[180px] truncate py-2.5 pr-3 text-slate-600">{ticket.companyName}</td>
                <td className="max-w-[160px] truncate py-2.5 pr-3 text-slate-600">{ticket.serviceName}</td>
                <td className="py-2.5 pr-3 text-slate-600">{ticket.status}</td>
                <td className="py-2.5 pr-3 text-slate-600">{ticket.priority}</td>
                <td className="py-2.5 text-slate-600">{ticketSlaRisk(ticket)}</td>
              </tr>)}
                {!visibleTickets.length && <tr><td colSpan={7} className="py-8 text-center text-xs text-slate-500">{tickets.length ? "No tickets match these filters." : "No active assigned tickets."}</td></tr>}
              </tbody>
            </table>
          </div>
        </div> : <div className="p-4 sm:p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <h2 className="text-base font-bold text-slate-900">{profileOnly ? "Profile details" : "Employee details"}</h2>
            {canEdit && (editingProfile ? <div className="flex gap-2"><button type="button" onClick={() => { setProfileDraft(employee); setSkillsDraft(employee.skills.join(", ")); setEditingProfile(false); }} className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold">Cancel</button><button type="button" onClick={saveProfile} className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white">Save</button></div> : <button type="button" onClick={() => { setProfileDraft(employee); setSkillsDraft(employee.skills.join(", ")); setEditingProfile(true); }} className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold">Edit</button>)}
          </div>
          <div className="space-y-5">
            <section><h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Personal details</h3><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{profileField("Date of birth", "dateOfBirth", profileDraft.dateOfBirth ?? "", "date")}{profileField("Gender", "gender", profileDraft.gender ?? "")}{profileField("Personal address", "personalAddress", profileDraft.personalAddress ?? "")}</div></section>
            <section className="border-t border-slate-100 pt-4"><h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Employment and support</h3><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{editingProfile && canManageEmployment ? <>
              <label className="block text-xs font-semibold text-slate-500">Support role<span className="mt-1 block"><SelectDropdown label="Support role" options={roles.map(({ id, name }) => ({ value: id, label: name }))} value={profileDraft.role} onChange={(value) => setProfileDraft({ ...profileDraft, role: value as RoleId })} /></span></label>
              <label className="block text-xs font-semibold text-slate-500">Department<span className="mt-1 block"><SelectDropdown label="Department" options={departments.map(({ id, name }) => ({ value: id, label: name }))} value={profileDraft.departmentId ?? ""} onChange={(value) => setProfileDraft({ ...profileDraft, departmentId: value })} placeholder="Select a department" /></span></label>
              <label className="block text-xs font-semibold text-slate-500">Team<span className="mt-1 block"><SelectDropdown label="Team" options={teams.map(({ id, name }) => ({ value: id, label: name }))} value={profileDraft.teamId ?? ""} onChange={(value) => setProfileDraft({ ...profileDraft, teamId: value })} placeholder="Select a team" /></span></label>
              <label className="block text-xs font-semibold text-slate-500">Work location<span className="mt-1 block"><SelectDropdown label="Work location" options={locations.map(({ id, name }) => ({ value: id, label: name }))} value={profileDraft.locationId ?? ""} onChange={(value) => setProfileDraft({ ...profileDraft, locationId: value })} placeholder="Select a location" /></span></label>
            </> : <>{profileField("Support role", "roleTitle", roleName, "text", false)}{profileField("Department", "departmentId", department, "text", false)}{!profileOnly && profileField("Team", "teamId", team, "text", false)}{profileField("Work location", "locationId", location, "text", false)}</>}
              {profileField("Employment type", "employmentType", profileDraft.employmentType ?? "", "text", canManageEmployment)}{profileField("Hire date", "hireDate", profileDraft.hireDate ?? "", "date", canManageEmployment)}{profileField("Manager", "managerName", profileDraft.managerName ?? "", "text", canManageEmployment)}{profileField("Time zone", "timeZone", profileDraft.timeZone ?? "")}{profileField("Shift or on-call schedule", "supportSchedule", profileDraft.supportSchedule ?? "", "text", canManageEmployment)}
              {editingProfile && canManageEmployment ? <div><ComboboxFilter label="Eligible services" options={services.map(({ id, name }) => ({ value: id, label: name }))} selectedValues={profileDraft.eligibleServiceIds ?? []} onChange={(eligibleServiceIds) => setProfileDraft({ ...profileDraft, eligibleServiceIds })} placeholder="Any service" /></div> : !profileOnly && profileField("Eligible services", "roleTitle", eligibleServices.join(", ") || "Any service", "text", false)}
              {editingProfile ? <label className="block text-xs font-semibold text-slate-500">Skills<input value={skillsDraft} onChange={(event) => setSkillsDraft(event.target.value)} className="mt-1 block min-h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-900" /></label> : profileField("Skills", "roleTitle", employee.skills.join(", "))}</div></section>
            <section className="border-t border-slate-100 pt-4"><h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Emergency contact</h3><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{profileField("Contact name", "emergencyContactName", profileDraft.emergencyContactName ?? "")}{profileField("Contact phone", "emergencyContactPhone", profileDraft.emergencyContactPhone ?? "")}</div></section>
            <section className="border-t border-slate-100 pt-4"><h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Bank and tax details</h3><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{profileField("Bank name", "bankName", profileDraft.bankName ?? "")}{profileField("Account holder", "accountHolderName", profileDraft.accountHolderName ?? "")}{profileField("Account number", "accountNumber", profileDraft.accountNumber ?? "")}{profileField("Routing number", "routingNumber", profileDraft.routingNumber ?? "")}{profileField("Tax ID", "taxId", profileDraft.taxId ?? "")}</div></section>
          </div>
        </div>}
      </section>
      {editingBanner && <EmployeeEditDialog employee={employee} teams={teams} canManageEmployment={canManageEmployment} onCancel={() => setEditingBanner(false)} onSave={(updates) => {
        if (onUpdateEmployee(updates)) setEditingBanner(false);
      }} />}
      {deleteDialogOpen && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/55 p-4" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setDeleteDialogOpen(false); }}><section role="alertdialog" aria-modal="true" aria-labelledby="delete-employee-title" className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-5 shadow-2xl"><h2 id="delete-employee-title" className="text-lg font-bold text-slate-900">Remove {employee.name}?</h2><p className="mt-2 text-sm text-slate-600">You can mark this employee unavailable and keep their account, or permanently delete the employee. Permanently deleting them leaves ticket history intact and unassigns their active tickets.{isCurrentUser ? " The active account cannot be permanently deleted while signed in." : ""}</p><div className="mt-4 space-y-3"><button type="button" onClick={() => { onUpdateEmployee({ status: "Off Shift" }); setDeleteDialogOpen(false); }} className="w-full rounded-lg border border-slate-300 px-4 py-3 text-left hover:bg-slate-50"><span className="block text-sm font-semibold text-slate-900">Mark unavailable</span><span className="mt-1 block text-xs text-slate-600">Keep the account and records; they will not receive new tickets.</span></button><div className="rounded-lg border border-red-200 p-3"><p className="text-sm font-semibold text-red-800">Permanently delete employee</p><label className="mt-2 block text-xs font-medium text-slate-700">Type <strong>{employee.name}</strong> to confirm<input value={deleteConfirmation} onChange={(event) => setDeleteConfirmation(event.target.value)} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-red-500 focus:ring-2 focus:ring-red-100" /></label><div className="mt-3 flex justify-end gap-2"><button type="button" onClick={() => setDeleteDialogOpen(false)} className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700">Cancel</button><button type="button" disabled={isCurrentUser || deleteConfirmation !== employee.name} onClick={onDeleteEmployee} className="rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-50">Permanently delete</button></div></div></div></section></div>}
    </div>
  );
};
