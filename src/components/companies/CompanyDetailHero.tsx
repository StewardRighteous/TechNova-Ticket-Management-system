import React, { useEffect, useState } from "react";
import type { Company, Ticket } from "../../types/barrel";

interface CompanyDetailHeroProps {
  company: Company;
  onBack: () => void;
  onUpdateCompany: (updates: Partial<Company>) => void;
  canEdit?: boolean;
  tickets?: Ticket[];
  onOpenTicket?: (ticketId: string) => void;
}

type Tab = "contact" | "account" | "system";
const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: "contact", label: "Contact", icon: "contacts" },
  { id: "account", label: "Account", icon: "business_center" },
  { id: "system", label: "System", icon: "settings" },
];
const fields: Record<
  Tab,
  { key: keyof Company; label: string; type?: string; readOnly?: boolean }[]
> = {
  contact: [
    { key: "id", label: "Company ID", readOnly: true },
    { key: "code", label: "Company code", readOnly: true },
    { key: "name", label: "Company name" },
    { key: "contactName", label: "Primary contact" },
    { key: "contactRole", label: "Contact role" },
    { key: "contactEmail", label: "Contact email", type: "email" },
    { key: "contactPhone", label: "Contact phone", type: "tel" },
  ],
  account: [
    { key: "tier", label: "Account tier" },
    { key: "accountManager", label: "Account manager" },
    { key: "status", label: "Account status" },
    { key: "preferredChannel", label: "Preferred channel" },
    { key: "activeContracts", label: "Active contracts", type: "number" },
    { key: "subscribedServices", label: "Subscribed services" },
  ],
  system: [
    {
      key: "activeTickets",
      label: "Active tickets",
      type: "number",
      readOnly: true,
    },
    { key: "slaResponseTime", label: "SLA response time" },
  ],
};
const allFields = (Object.keys(fields) as Tab[]).flatMap((tab) => fields[tab]);
const displayValue = (value: unknown) =>
  Array.isArray(value) ? value.join(", ") : String(value ?? "—");

export const CompanyDetailHero: React.FC<CompanyDetailHeroProps> = ({
  company,
  onUpdateCompany,
  canEdit = true,
  tickets = [],
  onOpenTicket,
}) => {
  const [draft, setDraft] = useState<Company>(company);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("contact");
  const [workspaceTab, setWorkspaceTab] = useState<"contacts" | "tickets" | "contracts">("contacts");
  const [confirmAction, setConfirmAction] = useState<"save" | "cancel" | null>(
    null,
  );
  useEffect(() => setDraft(company), [company]);

  const updateField = (key: keyof Company, value: string) =>
    setDraft((current) => ({
      ...current,
      [key]:
        key === "activeContracts" || key === "activeTickets"
          ? Number(value)
          : key === "subscribedServices"
            ? value
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean)
            : value,
    }));
  const finishAction = () => {
    if (confirmAction === "save") {
      onUpdateCompany(draft);
    } else if (confirmAction === "cancel") setDraft(company);
    setConfirmAction(null);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-slate-900 p-6 shadow-sm sm:p-8">
        <div className="flex items-center justify-between gap-3"><div><h1 className="text-2xl font-bold text-white">{company.name}</h1><span className="mt-2 inline-block rounded-full bg-indigo-400/20 px-3 py-1 text-xs font-semibold text-indigo-100">{company.tier} · {company.status}</span></div><div className="flex gap-2"><button type="button" onClick={() => setWorkspaceTab("contacts")} className="rounded-lg bg-white px-3 py-2 text-xs font-bold text-slate-900">Add Contact</button><button type="button" onClick={() => setWorkspaceTab("tickets")} className="rounded-lg bg-indigo-500 px-3 py-2 text-xs font-bold text-white">Log Interaction</button></div></div>
        <div className="mt-5 border-b border-slate-200" />
        <div className="mt-3 grid grid-cols-1 gap-1 sm:grid-cols-3">
          {[
            ["Account tier", company.tier],
            ["Account manager", company.accountManager],
            ["SLA response time", company.slaResponseTime],
            ["Primary contact", company.contactName],
            ["Active contracts", company.activeContracts],
            ["Active tickets", company.activeTickets],
          ].map(([label, value]) => (
            <div className="inline-flex gap-1 items-baseline" key={label}>
              <p className=" text-[10px] font-semibold tracking-wide text-slate-200 capitalize">
                {label}:
              </p>
              <p className="mt-1 text-sm font-semibold text-white">{value}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex gap-1 border-b border-slate-200 px-4 pt-3">
          {([['contacts', 'Contacts'], ['tickets', 'Active Tickets'], ['contracts', 'Contracts & Services']] as const).map(([id, label]) => (
            <button key={id} type="button" onClick={() => setWorkspaceTab(id)} className={`border-b-2 px-3 py-3 text-xs font-bold ${workspaceTab === id ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-slate-500'}`}>{label}</button>
          ))}
        </div>
        <div className="p-5">
          {workspaceTab === 'contacts' && <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="text-[10px] tracking-wider text-slate-500 uppercase"><tr><th className="pb-3">Contact</th><th className="pb-3">Role</th><th className="pb-3">Email</th><th className="pb-3">Phone</th></tr></thead><tbody className="divide-y divide-slate-100">{(company.contacts?.length ? company.contacts : [{ id: 'primary', name: company.contactName, email: company.contactEmail, phone: company.contactPhone, accountIdentifier: company.contactRole }]).map((contact) => <tr key={contact.id}><td className="py-3 font-semibold text-slate-900">{contact.name}</td><td className="py-3 text-slate-600">{contact.accountIdentifier || '—'}</td><td className="py-3 text-slate-600">{contact.email}</td><td className="py-3 text-slate-600">{contact.phone}</td></tr>)}</tbody></table></div>}
          {workspaceTab === 'tickets' && <div className="overflow-x-auto"><table className="w-full text-left text-xs"><thead className="text-[10px] tracking-wider text-slate-500 uppercase"><tr><th className="pb-3">Ticket</th><th className="pb-3">Title</th><th className="pb-3">Status</th></tr></thead><tbody className="divide-y divide-slate-100">{tickets.length ? tickets.map((ticket) => <tr key={ticket.id}><td className="py-3"><button className="font-bold text-indigo-700 hover:underline" onClick={() => onOpenTicket?.(ticket.id)}>{ticket.code}</button></td><td className="py-3 text-slate-700">{ticket.title}</td><td className="py-3 text-slate-600">{ticket.status}</td></tr>) : <tr><td className="py-4 text-slate-500" colSpan={3}>No active tickets.</td></tr>}</tbody></table></div>}
          {workspaceTab === 'contracts' && <div className="grid gap-3 sm:grid-cols-2">{company.subscribedServices.map((service) => <div key={service} className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="font-bold text-slate-900">{service}</p><p className="mt-1 text-xs text-slate-500">Active service · SLA {company.slaResponseTime}</p></div>)}</div>}
        </div>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Company details
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Review and manage the complete company profile.
            </p>
          </div>
          {!isEditing && canEdit ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
            >
              <span className="material-symbols-outlined text-[16px]">
                edit
              </span>{" "}
              Edit
            </button>
          ) : isEditing ? (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmAction("cancel")}
                className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setConfirmAction("save")}
                className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
              >
                Save
              </button>
            </div>
          ) : null}
        </div>
        {!isEditing && <div className="mt-5 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold ${activeTab === tab.id ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"}`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </div>}
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {(isEditing ? allFields : fields[activeTab]).map((field) => (
            <label
              key={field.key}
              className="text-xs font-semibold text-slate-500"
            >
              {field.label}
              {isEditing && !field.readOnly ? (
                <input
                  type={field.type || "text"}
                  value={displayValue(draft[field.key])}
                  onChange={(event) =>
                    updateField(field.key, event.target.value)
                  }
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              ) : (
                <span className="mt-2 block rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm font-normal text-slate-700">
                  {displayValue(draft[field.key])}
                </span>
              )}
            </label>
          ))}
        </div>
      </section>
      {confirmAction && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900">
              {confirmAction === "save" ? "Save changes?" : "Discard changes?"}
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              {confirmAction === "save"
                ? "Your company details will be updated."
                : "Your unsaved changes will be lost."}
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
              >
                Go back
              </button>
              <button
                type="button"
                onClick={finishAction}
                className={`rounded-lg px-3 py-2 text-sm font-semibold text-white ${confirmAction === "save" ? "bg-indigo-600 hover:bg-indigo-700" : "bg-red-600 hover:bg-red-700"}`}
              >
                {confirmAction === "save" ? "Save changes" : "Discard"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
