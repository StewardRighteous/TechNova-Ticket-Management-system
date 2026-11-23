import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Ticket } from "../../types/barrel";
import { useTicketStore } from "../../store/barrel";
import { filterTicketsByRole } from "../../utils/barrel";

const displayDate = (value: string) =>
  new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

const priorityStyles: Record<Ticket["priority"], string> = {
  "P1 Urgent": "bg-rose-50 text-rose-700 ring-rose-200",
  "P2 Normal": "bg-amber-50 text-amber-700 ring-amber-200",
  "P3 Low": "bg-sky-50 text-sky-700 ring-sky-200",
  "P4 Trivial": "bg-slate-100 text-slate-600 ring-slate-200",
};

const statusStyles: Record<Ticket["status"], string> = {
  Open: "bg-blue-50 text-blue-700",
  "Under Review": "bg-cyan-50 text-cyan-700",
  "In Progress": "bg-indigo-50 text-indigo-700",
  "Pending QA": "bg-violet-50 text-violet-700",
  Resolved: "bg-emerald-50 text-emerald-700",
  Closed: "bg-slate-100 text-slate-600",
  Escalated: "bg-rose-50 text-rose-700",
};

export const LatestUpdatesView: React.FC = () => {
  const navigate = useNavigate();
  const { data, activeRole, currentUser, setSelectedTicketId } = useTicketStore();
  const scopedTickets = filterTicketsByRole(
    data.tickets,
    activeRole,
    currentUser?.id,
  );
  const [range, setRange] = useState<"7" | "28">("7");
  const [companyId, setCompanyId] = useState("all");
  const [companySearch, setCompanySearch] = useState("");
  const [openMenu, setOpenMenu] = useState<"range" | "company" | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const companySearchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const closeMenus = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setOpenMenu(null);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenMenu(null);
    };
    document.addEventListener("mousedown", closeMenus);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeMenus);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  const latestActivity = scopedTickets.reduce(
    (latest, ticket) => Math.max(latest, Date.parse(ticket.updatedAt)),
    0,
  );
  const rangeStart = latestActivity - Number(range) * 24 * 60 * 60 * 1000;
  const tickets = scopedTickets
    .filter((ticket) => Date.parse(ticket.updatedAt) >= rangeStart)
    .filter((ticket) => companyId === "all" || ticket.companyId === companyId)
    .sort((a, b) => Date.parse(b.updatedAt) - Date.parse(a.updatedAt));
  const companies = [...new Map(scopedTickets.map((ticket) => [ticket.companyId, ticket.companyName])).entries()]
    .sort(([, a], [, b]) => a.localeCompare(b));
  const filteredCompanies = companies.filter(([, name]) =>
    name.toLocaleLowerCase().includes(companySearch.trim().toLocaleLowerCase()),
  );

  const rangeLabel = range === "7" ? "Last 7 days" : "Last 28 days";
  const companyLabel = companyId === "all"
    ? "All companies"
    : companies.find(([id]) => id === companyId)?.[1] || "All companies";

  const selectRange = (value: "7" | "28") => {
    setRange(value);
    setOpenMenu(null);
  };

  const selectCompany = (value: string) => {
    setCompanyId(value);
    setCompanySearch("");
    setOpenMenu(null);
  };

  const toggleCompanyMenu = () => {
    const willOpen = openMenu !== "company";
    setOpenMenu(willOpen ? "company" : null);
    if (willOpen) {
      setCompanySearch("");
      window.requestAnimationFrame(() => companySearchRef.current?.focus());
    }
  };

  const openTicket = (id: string) => {
    setSelectedTicketId(id);
    navigate(`/tickets/${encodeURIComponent(id)}`);
  };

  return (
    <div className="space-y-3 p-3">
      <div>
        <p className="mt-1 text-sm text-slate-500">
          Tickets ordered by their most recent activity.
        </p>
      </div>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
        <div className="flex items-center justify-between border-b border-slate-100 p-3.5">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined rounded-lg bg-indigo-50 p-1.5 text-[18px] text-indigo-600">
              update
            </span>
            <h2 className="text-base font-bold text-slate-900">Recent tickets</h2>
          </div>
          <div ref={menuRef} className="flex items-center gap-2">
            <div className="relative">
              <button
                type="button"
                aria-haspopup="menu"
                aria-expanded={openMenu === "range"}
                onClick={() => setOpenMenu(openMenu === "range" ? null : "range")}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <span className="material-symbols-outlined text-[17px] text-indigo-500">calendar_today</span>
                {rangeLabel}
                <span className="material-symbols-outlined text-[16px] text-slate-400">expand_more</span>
              </button>
              {openMenu === "range" && (
                <div role="menu" className="absolute right-0 z-20 mt-2 w-40 overflow-hidden rounded-xl border border-slate-200 bg-white p-1 shadow-lg shadow-slate-200/70">
                  {([ ["7", "Last 7 days"], ["28", "Last 28 days"] ] as const).map(([value, label]) => (
                    <button key={value} type="button" role="menuitemradio" aria-checked={range === value} onClick={() => selectRange(value)} className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold transition ${range === value ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50"}`}>
                      {label}
                      {range === value && <span className="material-symbols-outlined text-[16px]">check</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="relative">
              <button
                type="button"
                role="combobox"
                aria-controls="company-options"
                aria-haspopup="listbox"
                aria-expanded={openMenu === "company"}
                onClick={toggleCompanyMenu}
                className="inline-flex max-w-48 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:border-indigo-300 hover:bg-indigo-50/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
              >
                <span className="material-symbols-outlined text-[17px] text-indigo-500">business</span>
                <span className="truncate">{companyLabel}</span>
                <span className="material-symbols-outlined text-[16px] text-slate-400">expand_more</span>
              </button>
              {openMenu === "company" && (
                <div id="company-options" role="listbox" aria-label="Companies" className="absolute right-0 z-20 mt-2 w-64 overflow-hidden rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg shadow-slate-200/70">
                  <div className="relative mb-1.5">
                    <span className="material-symbols-outlined pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2 text-[17px] text-slate-400">search</span>
                    <input
                      ref={companySearchRef}
                      type="search"
                      role="searchbox"
                      value={companySearch}
                      onChange={(event) => setCompanySearch(event.target.value)}
                      placeholder="Search companies..."
                      aria-label="Search companies"
                      className="h-9 w-full rounded-lg border border-slate-200 bg-slate-50 pr-2 pl-8 text-xs font-medium text-slate-700 outline-none placeholder:text-slate-400 focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100"
                    />
                  </div>
                  <div className="max-h-56 overflow-y-auto">
                    {[ ["all", "All companies"], ...filteredCompanies ].map(([value, label]) => (
                      <button key={value} type="button" role="option" aria-selected={companyId === value} onClick={() => selectCompany(value)} className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-xs font-semibold transition ${companyId === value ? "bg-indigo-50 text-indigo-700" : "text-slate-600 hover:bg-slate-50"}`}>
                        <span className="truncate">{label}</span>
                        {companyId === value && <span className="material-symbols-outlined text-[16px]">check</span>}
                      </button>
                    ))}
                    {!filteredCompanies.length && <p className="px-3 py-3 text-xs text-slate-500">No companies found.</p>}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th scope="col" className="px-4 py-3">Last activity</th>
                <th scope="col" className="px-4 py-3">Ticket</th>
                <th scope="col" className="px-4 py-3">Company / service</th>
                <th scope="col" className="px-4 py-3">Status</th>
                <th scope="col" className="px-4 py-3">Priority</th>
                <th scope="col" className="px-4 py-3">Assignee</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tickets.map((ticket) => (
                <tr
                  key={ticket.id}
                  tabIndex={0}
                  onClick={(event) => {
                    if (event.detail === 0 || !window.getSelection()?.toString()) {
                      openTicket(ticket.id);
                    }
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      openTicket(ticket.id);
                    }
                  }}
                  className="cursor-pointer transition hover:bg-slate-50 focus:bg-indigo-50/50 focus:outline-none"
                >
                  <td className="whitespace-nowrap px-4 py-3 text-xs text-slate-600"><span className="cursor-text">{displayDate(ticket.updatedAt)}</span></td>
                  <td className="px-4 py-3">
                    <span className="block w-fit cursor-text font-mono text-xs font-bold text-slate-500">{ticket.code}</span>
                    <span className="mt-1 block w-fit max-w-[360px] cursor-text truncate text-xs font-semibold text-slate-900">{ticket.title}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        navigate(`/companies/${encodeURIComponent(ticket.companyId)}`);
                      }}
                      onKeyDown={(event) => event.stopPropagation()}
                      className="block max-w-[200px] truncate text-left text-xs font-medium text-slate-800 hover:text-indigo-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1"
                      title={`View ${ticket.companyName}`}
                    >
                      {ticket.companyName}
                    </button>
                    <span className="mt-1 block w-fit max-w-[200px] cursor-text truncate text-[11px] text-slate-500">{ticket.serviceName}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex cursor-text whitespace-nowrap rounded-full px-2 py-1 text-[11px] font-semibold ${statusStyles[ticket.status]}`}>{ticket.status}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex cursor-text whitespace-nowrap rounded-full px-2 py-1 text-[11px] font-semibold ring-1 ring-inset ${priorityStyles[ticket.priority]}`}>{ticket.priority}</span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        navigate(`/employees/${encodeURIComponent(ticket.assignedToId)}`);
                      }}
                      onKeyDown={(event) => event.stopPropagation()}
                      className="max-w-[180px] truncate text-left text-xs text-slate-600 hover:text-indigo-700 hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1"
                      title={`View ${ticket.assignedToName}`}
                    >
                      {ticket.assignedToName}
                    </button>
                  </td>
                </tr>
              ))}
              {!tickets.length && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-xs text-slate-500">No tickets available.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
