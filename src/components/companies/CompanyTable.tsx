import React, { useState } from "react";
import type { Company } from "../../types/barrel";
import { ComboboxFilter, NumericPagination, TableHeaderSection } from "../common/barrel";

interface CompanyTableProps {
  companies: Company[];
  onViewCompany: (companyId: string) => void;
}

type SortField = "name" | "tier" | "contact" | "tickets" | "sla";

export const CompanyTable: React.FC<CompanyTableProps> = ({
  companies,
  onViewCompany,
}) => {
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const filtered = companies.filter((c) => {
    if (tierFilter !== "all" && c.tier !== tierFilter) return false;
    if (statusFilter.length > 0 && !statusFilter.includes(c.status)) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.contactName.toLowerCase().includes(q) ||
        c.accountManager.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    if (sortField === "name") cmp = a.name.localeCompare(b.name);
    else if (sortField === "tier") cmp = a.tier.localeCompare(b.tier);
    else if (sortField === "contact")
      cmp = a.contactName.localeCompare(b.contactName);
    else if (sortField === "tickets") cmp = a.activeTickets - b.activeTickets;
    else if (sortField === "sla")
      cmp = a.slaResponseTime.localeCompare(b.slaResponseTime);
    return sortAsc ? cmp : -cmp;
  });

  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <TableHeaderSection
        title="All Companies"
        searchQuery={search}
        onSearchChange={(s) => {
          setSearch(s);
          setPage(1);
        }}
        searchPlaceholder="Filter companies or contacts..."
      >
        <div className="flex flex-wrap items-center gap-2">
          <ComboboxFilter label="Account tier" singleSelect selectedValues={tierFilter === "all" ? [] : [tierFilter]} onChange={(v) => { setTierFilter(v[0] || "all"); setPage(1); }} options={[...new Set(companies.map((c) => c.tier))].map((v) => ({ value: v, label: v }))} />
          <ComboboxFilter label="Status" selectedValues={statusFilter} onChange={(v) => { setStatusFilter(v); setPage(1); }} options={[...new Set(companies.map((c) => c.status))].map((v) => ({ value: v, label: v }))} />
        </div>
      </TableHeaderSection>

      <div className="space-x-1 overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead className="bg-slate-900 text-[11px] font-semibold tracking-wider text-white uppercase select-none">
            <tr>
              <th
                className="cursor-pointer px-6 py-3"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center gap-1">
                  <span>Company Name</span>
                  <span className="material-symbols-outlined text-[15px] opacity-70">
                    {sortField === "name"
                      ? sortAsc
                        ? "arrow_drop_up"
                        : "arrow_drop_down"
                      : "unfold_more"}
                  </span>
                </div>
              </th>
              <th className="px-4 py-3">
                <span>Primary Executive</span>
              </th>
              <th className="px-4 py-3">
                <span>Tier</span>
              </th>
              <th className="px-4 py-3">
                <span>Lead</span>
              </th>

              <th className="px-4 py-3">Email</th>

              <th
                className="flex items-center px-4 py-3"
                onClick={() => handleSort("tickets")}
              >
                <span>Tickets</span>
                <span className="material-symbols-outlined text-[15px] opacity-70">
                  {sortField === "tickets"
                    ? sortAsc
                      ? "arrow_drop_up"
                      : "arrow_drop_down"
                    : "unfold_more"}
                </span>
              </th>
              <th className="px-6 py-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {paginated.map((c) => (
              <tr
                key={c.id}
                className="group transition-colors hover:bg-indigo-50/40"
              >
                <td className="px-6 py-3.5 whitespace-nowrap">
                  <div className="flex items-center gap-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50 text-xs font-bold text-slate-600">
                      {c.code}
                    </div>
                    <div>
                      <span className="block font-bold text-slate-900 transition-colors group-hover:text-indigo-600">
                        {c.name}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="flex items-center gap-2 px-4 py-3.5 whitespace-nowrap">
                  <span className="material-symbols-outlined text-slate-400">
                    account_circle
                  </span>
                  <div>
                    <span className="block font-semibold text-slate-800">
                      {c.contactName}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {c.contactRole}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold text-slate-800">
                    <span className="material-symbols-outlined text-slate-400">
                      domain
                    </span>
                    {c.tier}
                  </span>
                </td>
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-semibold text-slate-800">
                    <span className="material-symbols-outlined text-slate-400">
                      person
                    </span>
                    {c.accountManager}
                  </span>
                </td>

                <td className="px-4 py-3.5 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1 text-[11px] text-slate-800">
                    <span className="material-symbols-outlined text-[13px] text-slate-400">
                      mail
                    </span>
                    {c.contactEmail}
                  </span>
                </td>

                <td className="px-4 py-3.5 whitespace-nowrap text-slate-800">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[13px] text-slate-400">
                      confirmation_number
                    </span>
                    {c.activeTickets} Tickets
                  </span>
                </td>
                <td className="px-6 py-3.5 text-left whitespace-nowrap">
                  <button
                onClick={() => onViewCompany(c.id)}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 shadow-sm transition-all hover:bg-indigo-600 hover:text-white"
                  >
                    <span className="material-symbols-outlined text-[15px]">
                      visibility
                    </span>
                    <span>View</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <NumericPagination
        totalItems={filtered.length}
        currentPage={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        pageSizeOptions={[5, 10, 25]}
      />
    </div>
  );
};
