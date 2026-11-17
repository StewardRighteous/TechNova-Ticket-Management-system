import React, { useState } from "react";
import type { Company, ServiceLine, Ticket } from "../../types/barrel";

interface ServiceDetailHeroProps {
  service: ServiceLine;
  tickets?: Ticket[];
  companies?: Company[];
  onUpdateService: (updates: Partial<ServiceLine>) => void;
  onOpenTicket?: (ticketId: string) => void;
}
type Tab = "details" | "tickets" | "companies";

export const ServiceDetailHero: React.FC<ServiceDetailHeroProps> = ({
  service,
  tickets = [],
  companies = [],
  onUpdateService,
  onOpenTicket,
}) => {
  const [tab, setTab] = useState<Tab>("details");
  const [editing, setEditing] = useState(false);
  const [description, setDescription] = useState(service.description);
  const linkedTickets = tickets.filter(
    (ticket) =>
      ticket.serviceId === service.id &&
      !["Resolved", "Closed"].includes(ticket.status),
  );
  const subscribedCompanies = companies.filter(
    (company) =>
      company.subscribedServices.includes(service.name) ||
      company.subscribedServices.includes(service.code),
  );
  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-slate-900 p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
        
            <h1 className="mt-1 text-2xl font-bold text-white">
              {service.name}
            </h1>
           
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setTab("tickets")}
              className="rounded-lg bg-white px-3 py-2 text-xs font-bold text-slate-900"
            >
              View active tickets
            </button>
            <button
              type="button"
              onClick={() => setTab("details")}
              className="rounded-lg bg-indigo-500 px-3 py-2 text-xs font-bold text-white"
            >
              View escalation guide
            </button>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-700 pt-5 sm:grid-cols-4">
          {[
            ["Department lead", service.lead],
            ["Status", service.status],
            ["SLA target", service.slaTarget],
            ["Uptime", service.uptime],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-[10px] font-semibold tracking-wide text-slate-400 uppercase">
                {label}
              </p>
              <p className="mt-1 text-sm font-semibold text-white">{value}</p>
            </div>
          ))}
        </div>
      </section>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[
          ["Active Tickets", service.activeTickets],
          ["Health / Uptime", service.uptime],
          [
            "Assigned Specialists",
            new Set(linkedTickets.map((ticket) => ticket.assignedToId)).size,
          ],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
              {label}
            </p>
            <p className="mt-2 text-2xl font-bold text-slate-900">{value}</p>
          </div>
        ))}
      </div>
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex gap-1 overflow-x-auto border-b border-slate-200 px-4 pt-3">
          {(
            [
              ["details", "Service Details"],
              ["tickets", "Linked Tickets"],
              ["companies", "Subscribed Companies"],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              onClick={() => setTab(id)}
              className={`border-b-2 px-3 py-3 text-xs font-bold ${tab === id ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-500"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="p-5">
          {tab === "details" && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold text-slate-900">
                  Service details
                </h2>
                {editing ? (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setDescription(service.description);
                        setEditing(false);
                      }}
                      className="text-xs font-semibold text-slate-500"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onUpdateService({ description });
                        setEditing(false);
                      }}
                      className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-bold text-white"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setEditing(true)}
                    className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-bold text-slate-700"
                  >
                    Edit
                  </button>
                )}
              </div>
              {editing ? (
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  className="min-h-24 w-full rounded-lg border border-slate-300 p-3 text-sm"
                />
              ) : (
                <p className="text-sm leading-6 text-slate-600">
                  {service.description}
                </p>
              )}
              <div>
                <h3 className="text-xs font-bold tracking-wide text-slate-400 uppercase">
                  Supported technology stack
                </h3>
                <div className="mt-2 flex flex-wrap gap-2">
                  {service.technologies.map((technology) => (
                    <span
                      key={technology}
                      className="rounded-md bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700"
                    >
                      {technology}
                    </span>
                  ))}
                </div>
              </div>
              <div className="rounded-xl bg-amber-50 p-4">
                <h3 className="text-xs font-bold tracking-wide text-amber-800 uppercase">
                  Escalation guidelines
                </h3>
                <p className="mt-1 text-sm text-amber-900">
                  Escalate unresolved incidents approaching the{" "}
                  {service.slaTarget} target to {service.lead} with diagnostic
                  context and customer impact.
                </p>
              </div>
            </div>
          )}
          {tab === "tickets" && (
            <LinkedTickets
              tickets={linkedTickets}
              onOpenTicket={onOpenTicket}
            />
          )}
          {tab === "companies" && (
            <CompanyList companies={subscribedCompanies} />
          )}
        </div>
      </section>
    </div>
  );
};
const LinkedTickets: React.FC<{
  tickets: Ticket[];
  onOpenTicket?: (id: string) => void;
}> = ({ tickets, onOpenTicket }) => (
  <div>
    <h2 className="text-lg font-bold text-slate-900">Linked tickets</h2>
    <div className="mt-4 overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead className="text-[10px] tracking-wide text-slate-500 uppercase">
          <tr>
            <th className="pb-3">Ticket</th>
            <th className="pb-3">Title</th>
            <th className="pb-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {tickets.length ? (
            tickets.map((ticket) => (
              <tr key={ticket.id}>
                <td className="py-3">
                  <button
                    type="button"
                    onClick={() => onOpenTicket?.(ticket.id)}
                    className="font-bold text-indigo-700 hover:underline"
                  >
                    {ticket.code}
                  </button>
                </td>
                <td className="py-3 text-slate-700">{ticket.title}</td>
                <td className="py-3 text-slate-600">{ticket.status}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} className="py-4 text-slate-500">
                No active tickets linked to this service.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);
const CompanyList: React.FC<{ companies: Company[] }> = ({ companies }) => (
  <div>
    <h2 className="text-lg font-bold text-slate-900">
      Subscribed client companies
    </h2>
    <div className="mt-4 overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead className="text-[10px] tracking-wide text-slate-500 uppercase">
          <tr>
            <th className="pb-3">Company</th>
            <th className="pb-3">Tier</th>
            <th className="pb-3">Account manager</th>
            <th className="pb-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {companies.length ? (
            companies.map((company) => (
              <tr key={company.id}>
                <td className="py-3 font-semibold text-slate-900">
                  {company.name}
                </td>
                <td className="py-3">{company.tier}</td>
                <td className="py-3">{company.accountManager}</td>
                <td className="py-3">{company.status}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="py-4 text-slate-500">
                No subscribed companies found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
);
