import React, { useEffect, useState } from "react";
import type { Department, Employee, Location, Team, Ticket } from "../../types/barrel";
import { ComboboxFilter } from "../common/ComboboxFilter";
import { StaffAvatar } from "../common/StaffAvatar";

interface EmployeeDetailHeroProps {
  employee: Employee;
  tickets: Ticket[];
  onBack: () => void;
  onUpdateEmployee: (updates: Partial<Employee>) => void;
  onOpenTicket?: (ticketId: string) => void;
  teams?: Team[];
  departments?: Department[];
  locations?: Location[];
}

type WorkspaceTab = "tickets" | "profile";
type TicketFilter = "status" | "priority" | "service" | "company";
const textValue = (value: unknown) => Array.isArray(value) ? value.join(", ") : String(value ?? "—");
const readOnlyField = (label: string, value: unknown, className = "") => <label className={`block text-[11px] font-semibold text-slate-500 ${className}`}>{label}<input readOnly value={String(value ?? "")} placeholder="Not provided" className="mt-1 block w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-normal text-slate-800 outline-none" /></label>;

export const EmployeeDetailHero: React.FC<EmployeeDetailHeroProps> = ({
  employee,
  tickets,
  onBack,
  onUpdateEmployee,
  onOpenTicket,
  teams = [],
  departments = [],
  locations = [],
}) => {
  const [draft, setDraft] = useState<Employee>(employee);
  const [editing, setEditing] = useState(false);
  const [workspaceTab, setWorkspaceTab] = useState<WorkspaceTab>("profile");
  const [ticketFilters, setTicketFilters] = useState<Record<TicketFilter, string[]>>({ status: [], priority: [], service: [], company: [] });
  const [confirmation, setConfirmation] = useState<"save" | "cancel" | null>(null);
  useEffect(() => setDraft(employee), [employee]);

  const updateField = (key: keyof Employee, value: string) => setDraft((current) => ({
    ...current,
    [key]: key === "capacityMax" ? Number(value) : key === "skills" || key === "permissions"
      ? value.split(",").map((item) => item.trim()).filter(Boolean)
      : value,
  }));
  const completeAction = () => {
    if (confirmation === "save") onUpdateEmployee(draft);
    else if (confirmation === "cancel") setDraft(employee);
    setConfirmation(null);
    setEditing(false);
  };

  const department = departments.find((item) => item.id === employee.departmentId)?.name || "Not assigned";
  const team = teams.find((item) => item.id === employee.teamId)?.name || "Not assigned";
  const location = locations.find((item) => item.id === employee.locationId)?.name || "Remote / distributed";
  const totalAssigned = employee.activeTicketsCount;
  const onTarget = tickets.filter((ticket) => ticket.slaRisk !== "Breached").length;
  const allAssignedCount = Math.max(totalAssigned, tickets.length);
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

  return (
    <div className="space-y-3.5">
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-slate-900 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-3 px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-white/10 text-teal-200"><StaffAvatar src={employee.avatar} alt={`${employee.name} profile`} sizeClassName="h-12 w-12" fallbackClassName="text-[23px]" /></span>
            <div className="min-w-0">
              <h1 className="truncate text-lg font-bold text-white">{employee.name}</h1>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-200">
                <span>{employee.roleTitle}</span><span aria-hidden="true">·</span>
                <span className={`rounded-full px-2 py-0.5 font-semibold ${employee.status === "Available" ? "bg-teal-400/20 text-teal-100" : employee.status === "Busy" ? "bg-amber-300/20 text-amber-100" : "bg-white/15 text-slate-200"}`}>{employee.status}</span>
              </div>
            </div>
          </div>
          <button type="button" onClick={() => setWorkspaceTab("tickets")} className="shrink-0 self-center rounded-lg bg-teal-500 px-3 py-2 text-xs font-semibold text-white hover:bg-teal-600">View ticket activity</button>
        </div>
        <div className="grid grid-cols-2 border-t border-white/15 sm:grid-cols-4">
          {[
            ["Email", employee.email, "mail"],
            ["Phone", employee.phone, "call"],
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
        <div role="tablist" aria-label="Employee workspace" className="flex border-b border-slate-200 px-3 sm:px-4">
          {([ ["profile", "Profile & Skills"], ["tickets", "Assigned Tickets"] ] as [WorkspaceTab, string][]).map(([tab, label]) => (
            <button key={tab} type="button" role="tab" aria-selected={workspaceTab === tab} onClick={() => setWorkspaceTab(tab)} className={`border-b-2 px-3 py-3 text-xs font-bold transition-colors sm:px-4 ${workspaceTab === tab ? "border-teal-600 text-teal-700" : "border-transparent text-slate-500 hover:text-slate-800"}`}>{label}</button>
          ))}
        </div>

        {workspaceTab === "tickets" ? <div className="p-4 sm:p-5">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div><h2 className="text-base font-bold text-slate-900">{visibleTickets.length} of {tickets.length} active {tickets.length === 1 ? "ticket" : "tickets"}</h2><p className="mt-0.5 text-xs text-slate-500">Assigned work and current status</p></div>
            <div className="flex flex-wrap items-end justify-end gap-2">
              <div className="w-40 self-center"><div className="mb-1 flex justify-between text-[11px] text-slate-500"><span>Capacity</span><span>{tickets.length} / {employee.capacityMax}</span></div><div className="h-1.5 overflow-hidden rounded-full bg-slate-100"><div className="h-full rounded-full bg-teal-600" style={{ width: `${Math.min(100, tickets.length / Math.max(1, employee.capacityMax) * 100)}%` }} /></div></div>
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
                <td className="py-2.5 text-slate-600">{ticket.slaRisk}</td>
              </tr>)}
                {!visibleTickets.length && <tr><td colSpan={7} className="py-8 text-center text-xs text-slate-500">{tickets.length ? "No tickets match these filters." : "No active assigned tickets."}</td></tr>}
              </tbody>
            </table>
          </div>
        </div> : <div className="p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div><h2 className="text-base font-bold text-slate-900">Employee profile</h2><p className="mt-0.5 text-xs text-slate-500">Contact, team, skills and access.</p></div>
            {!editing ? <button type="button" onClick={() => setEditing(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"><span className="material-symbols-outlined text-[15px]">edit</span>Edit</button> : <div className="flex gap-2"><button type="button" onClick={() => setConfirmation("cancel")} className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100">Cancel</button><button type="button" onClick={() => setConfirmation("save")} className="rounded-lg bg-teal-600 px-3 py-2 text-xs font-semibold text-white hover:bg-teal-700">Save</button></div>}
          </div>

          <div className="grid items-start gap-2 md:grid-cols-2">
            <div className="rounded-lg border border-slate-200 p-3"><h3 className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-900"><span className="material-symbols-outlined text-base text-teal-700">contact_page</span>Contact</h3>
              {editing ? <div className="grid gap-2 sm:grid-cols-2"><label className="text-[11px] font-semibold text-slate-500 sm:col-span-2">Email<input type="email" value={draft.email} onChange={(event) => updateField("email", event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" /></label><label className="text-[11px] font-semibold text-slate-500 sm:col-span-2">Phone<input type="tel" value={draft.phone} onChange={(event) => updateField("phone", event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" /></label></div> : <div className="grid gap-2 sm:grid-cols-2">{readOnlyField("Email", employee.email, "sm:col-span-2")}{readOnlyField("Phone", employee.phone, "sm:col-span-2")}</div>}
            </div>
            <div className="rounded-lg border border-slate-200 p-3"><h3 className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-900"><span className="material-symbols-outlined text-base text-teal-700">groups</span>Team & permissions</h3>
              {editing ? <div className="grid gap-2 sm:grid-cols-2"><label className="text-[11px] font-semibold text-slate-500">Team<input value={draft.teamId} onChange={(event) => updateField("teamId", event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" /></label><label className="text-[11px] font-semibold text-slate-500">Department<input value={draft.departmentId} onChange={(event) => updateField("departmentId", event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" /></label><label className="text-[11px] font-semibold text-slate-500">Status<input value={draft.status} onChange={(event) => updateField("status", event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" /></label><label className="text-[11px] font-semibold text-slate-500">Permissions<input value={textValue(draft.permissions)} onChange={(event) => updateField("permissions", event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" /></label></div> : <div className="grid gap-2 sm:grid-cols-2">{readOnlyField("Team", team)}{readOnlyField("Department", department)}{readOnlyField("Status", employee.status)}{readOnlyField("Permissions", textValue(employee.permissions) === "—" ? "Standard access" : textValue(employee.permissions))}</div>}
            </div>
            <div className="rounded-lg border border-slate-200 p-3 md:col-span-2"><h3 className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-900"><span className="material-symbols-outlined text-base text-teal-700">psychology</span>Skills</h3>
              {editing ? <label className="block text-[11px] font-semibold text-slate-500">Skills<input value={textValue(draft.skills)} onChange={(event) => updateField("skills", event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" /></label> : readOnlyField("Skills", textValue(employee.skills))}
            </div>
            <div className="rounded-lg border border-slate-200 p-3"><h3 className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-900"><span className="material-symbols-outlined text-base text-teal-700">person</span>Personal details</h3>
              {editing ? <div className="grid gap-2 sm:grid-cols-2">
                {([["dateOfBirth", "Date of birth", "date"], ["gender", "Gender", "text"], ["personalAddress", "Home address", "text"]] as [keyof Employee, string, string][]).map(([key, label, type]) => <label key={key} className={`text-[11px] font-semibold text-slate-500 ${key === "personalAddress" ? "sm:col-span-2" : ""}`}>{label}<input type={type} value={textValue(draft[key]) === "—" ? "" : textValue(draft[key])} onChange={(event) => updateField(key, event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" /></label>)}
              </div> : <div className="grid gap-2 sm:grid-cols-2">{readOnlyField("Date of birth", employee.dateOfBirth)}{readOnlyField("Gender", employee.gender)}{readOnlyField("Home address", employee.personalAddress, "sm:col-span-2")}</div>}
            </div>
            <div className="rounded-lg border border-slate-200 p-3"><h3 className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-900"><span className="material-symbols-outlined text-base text-teal-700">work_history</span>Employment</h3>
              {editing ? <div className="grid gap-2 sm:grid-cols-2">{([["employmentType", "Employment type", "text"], ["hireDate", "Start date", "date"], ["managerName", "Reports to", "text"]] as [keyof Employee, string, string][]).map(([key, label, type]) => <label key={key} className={`text-[11px] font-semibold text-slate-500 ${key === "managerName" ? "sm:col-span-2" : ""}`}>{label}<input type={type} value={textValue(draft[key]) === "—" ? "" : textValue(draft[key])} onChange={(event) => updateField(key, event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" /></label>)}</div> : <div className="grid gap-2 sm:grid-cols-2">{readOnlyField("Employment type", employee.employmentType)}{readOnlyField("Start date", employee.hireDate)}{readOnlyField("Reports to", employee.managerName, "sm:col-span-2")}</div>}
            </div>
            <div className="rounded-lg border border-slate-200 p-3"><h3 className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-900"><span className="material-symbols-outlined text-base text-teal-700">account_balance</span>Banking & payroll</h3>
              {editing ? <div className="grid gap-2 sm:grid-cols-2">{([["bankName", "Bank name"], ["accountHolderName", "Account holder"], ["accountNumber", "Account number"], ["routingNumber", "Routing / IFSC code"], ["taxId", "Tax ID"]] as [keyof Employee, string][]).map(([key, label]) => <label key={key} className="text-[11px] font-semibold text-slate-500">{label}<input value={textValue(draft[key]) === "—" ? "" : textValue(draft[key])} onChange={(event) => updateField(key, event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" /></label>)}</div> : <div className="grid gap-2 sm:grid-cols-2">{readOnlyField("Bank name", employee.bankName)}{readOnlyField("Account holder", employee.accountHolderName)}{readOnlyField("Account number", employee.accountNumber ? `•••• ${employee.accountNumber.slice(-4)}` : undefined)}{readOnlyField("Routing / IFSC code", employee.routingNumber)}{readOnlyField("Tax ID", employee.taxId)}</div>}
              {!editing && <p className="mt-3 text-[10px] text-slate-400">Sensitive payroll details are visible only to authorized managers.</p>}
            </div>
            <div className="rounded-lg border border-slate-200 p-3"><h3 className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-900"><span className="material-symbols-outlined text-base text-teal-700">contact_emergency</span>Emergency contact</h3>
              {editing ? <div className="grid gap-2 sm:grid-cols-2">{([["emergencyContactName", "Contact name"], ["emergencyContactPhone", "Contact phone"]] as [keyof Employee, string][]).map(([key, label]) => <label key={key} className="text-[11px] font-semibold text-slate-500">{label}<input value={textValue(draft[key]) === "—" ? "" : textValue(draft[key])} onChange={(event) => updateField(key, event.target.value)} className="mt-1 block w-full rounded-lg border border-slate-200 px-3 py-2 text-sm font-normal text-slate-800 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-100" /></label>)}</div> : <div className="grid gap-2 sm:grid-cols-2">{readOnlyField("Contact name", employee.emergencyContactName)}{readOnlyField("Contact phone", employee.emergencyContactPhone)}</div>}
            </div>
            <div className="flex flex-wrap gap-x-6 gap-y-2 px-1 text-xs text-slate-600 md:col-span-2"><span><strong className="text-slate-800">Capacity:</strong> {tickets.length} / {editing ? <input aria-label="Maximum capacity" type="number" min="0" value={draft.capacityMax} onChange={(event) => updateField("capacityMax", event.target.value)} className="w-16 rounded border border-slate-200 px-1 py-0.5" /> : employee.capacityMax} active</span><span><strong className="text-slate-800">SLA:</strong> {onTarget} / {Math.max(1, allAssignedCount)} on target</span><span><strong className="text-slate-800">Location:</strong> {editing ? <input aria-label="Location" value={draft.locationId} onChange={(event) => updateField("locationId", event.target.value)} className="w-36 rounded border border-slate-200 px-1 py-0.5" /> : location}</span></div>
          </div>
        </div>}
      </section>

      {confirmation && <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4" role="dialog" aria-modal="true"><div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-4 shadow-xl"><h3 className="text-base font-bold text-slate-900">{confirmation === "save" ? "Save changes?" : "Discard changes?"}</h3><p className="mt-1.5 text-sm text-slate-500">{confirmation === "save" ? "Your employee details will be updated." : "Your unsaved changes will be lost."}</p><div className="mt-4 flex justify-end gap-2"><button type="button" onClick={() => setConfirmation(null)} className="rounded-md px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-100">Go back</button><button type="button" onClick={completeAction} className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-slate-800">{confirmation === "save" ? "Save changes" : "Discard"}</button></div></div></div>}
    </div>
  );
};
