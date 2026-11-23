import React, { useState } from "react";
import type { Company } from "../../types/barrel";
import { ComboboxFilter, NumericPagination, TableSearch } from "../common/barrel";

const companyMarks: Record<string, string> = {
  "comp-1": "apex",
  "comp-2": "cloudscale",
  "comp-3": "nexabio",
  "comp-4": "omnilogistics",
  "comp-5": "zenith",
  "comp-6": "innovatecorp",
};

interface CompanyTableProps {
  companies: Company[];
  onViewCompany: (companyId: string) => void;
  onCreateNew?: () => void;
}

export const CompanyTable: React.FC<CompanyTableProps> = ({
  companies,
  onViewCompany,
  onCreateNew,
}) => {
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState<string>("all");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

  const filtered = companies.filter((c) => {
    if (tierFilter !== "all" && c.tier !== tierFilter) return false;
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

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  React.useEffect(() => {
    setPage((current) => Math.min(current, Math.max(1, Math.ceil(filtered.length / pageSize))));
  }, [filtered.length, pageSize]);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="bg-slate-900 px-5 py-5 text-white sm:px-6">
        <h2 className="text-lg font-bold tracking-tight">All Companies</h2>
        <p className="mt-1 text-xs text-slate-300">Browse and manage customer companies.</p>
      </div>
      <div className="flex flex-wrap items-center gap-2.5 border-b border-slate-200 bg-white px-5 py-3 sm:px-6">
        <TableSearch id="company-search" value={search} onChange={(value) => { setSearch(value); setPage(1); }} placeholder="Filter companies or contacts..." aria-label="Filter companies or contacts" className="min-w-52 max-w-[480px] flex-1" />
        <div className="ml-auto flex flex-wrap items-center justify-end gap-2.5">
          <ComboboxFilter label="Account tier" singleSelect selectedValues={tierFilter === "all" ? [] : [tierFilter]} onChange={(v) => { setTierFilter(v[0] || "all"); setPage(1); }} options={[...new Set(companies.map((c) => c.tier))].map((v) => ({ value: v, label: v }))} />
          {onCreateNew && <button type="button" onClick={onCreateNew} className="flex shrink-0 items-center gap-1 rounded-lg bg-teal-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-700"><span aria-hidden="true" className="material-symbols-outlined text-[16px]">add</span> New</button>}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead className="bg-white text-[11px] font-bold tracking-wider text-slate-700 uppercase select-none">
            <tr>
              <th className="px-5 py-2.5">Company Name</th>
              <th className="px-4 py-2.5">
                <span>Primary Executive</span>
              </th>
              <th className="px-4 py-2.5">
                <span>Tier</span>
              </th>
              <th className="px-4 py-2.5">
                <span>Lead</span>
              </th>

              <th className="px-4 py-2.5">Email</th>

              <th className="px-4 py-2.5">Tickets</th>
              <th className="px-5 py-2.5 text-left">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {paginated.map((c) => (
              <tr
                key={c.id}
                className={`group cursor-pointer transition-colors hover:bg-teal-50/50 ${selectedCompanyId === c.id ? "bg-teal-50" : ""}`}
                onClick={() => setSelectedCompanyId(c.id)}
                onDoubleClick={() => onViewCompany(c.id)}
              >
                <td className="px-5 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2.5">
                    {c.logo && !c.logo.includes("#") ? <img src={c.logo} alt="" className="size-8 shrink-0 rounded object-contain" /> : <svg aria-hidden="true" className="size-8 shrink-0" viewBox="0 0 32 32">
                      <use href={c.logo ? `/${c.logo}` : `/company-marks.svg#${companyMarks[c.id] ?? "company"}`} />
                    </svg>}
                    <div>
                      <button type="button" onClick={(event) => { event.stopPropagation(); onViewCompany(c.id); }} className="block text-left font-bold text-slate-900 transition-colors group-hover:text-teal-700 focus-visible:outline-2 focus-visible:outline-teal-600">
                        {c.name}
                      </button>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center gap-2">
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
                <td className="px-5 py-3 text-left whitespace-nowrap">
                  <button
                    type="button"
                    onClick={(event) => { event.stopPropagation(); onViewCompany(c.id); }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                  >
                    <span className="material-symbols-outlined text-[15px]">
                      visibility
                    </span>
                    <span>View</span>
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={7} className="px-5 py-12 text-center text-sm text-slate-500">{companies.length === 0 ? "No companies available." : "No matching companies. Try adjusting your search or filters."}</td></tr>}
          </tbody>
        </table>
      </div>

      <NumericPagination
        totalItems={filtered.length}
        currentPage={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        pageSizeOptions={[10, 25, 50]}
      />
    </div>
  );
};
