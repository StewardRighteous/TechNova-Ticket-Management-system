import React, { useState } from "react";
import type { ServiceLine } from "../../types";
import { TablePagination, TableHeaderSection } from "../common";

interface ServiceTableProps {
  services: ServiceLine[];
  onViewService: (serviceId: string) => void;
}

type SortField = "name" | "code" | "lead" | "sla" | "tickets" | "uptime";

export const ServiceTable: React.FC<ServiceTableProps> = ({
  services,
  onViewService,
}) => {
  const [search, setSearch] = useState("");
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

  const filtered = services.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.code.toLowerCase().includes(q) ||
      s.lead.toLowerCase().includes(q) ||
      s.department.toLowerCase().includes(q)
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    let comparison = 0;
    if (sortField === "name") comparison = a.name.localeCompare(b.name);
    else if (sortField === "code") comparison = a.code.localeCompare(b.code);
    else if (sortField === "lead") comparison = a.lead.localeCompare(b.lead);
    else if (sortField === "sla")
      comparison = a.slaTarget.localeCompare(b.slaTarget);
    else if (sortField === "uptime")
      comparison = a.uptime.localeCompare(b.uptime);
    else if (sortField === "tickets")
      comparison = a.activeTickets - b.activeTickets;
    return sortAsc ? comparison : -comparison;
  });

  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <TableHeaderSection
        title="All Services"
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Filter services or lead..."
      />

      <div className="space-x-1 overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead className="bg-slate-900 text-[11px] font-semibold tracking-wider text-white uppercase select-none">
            <tr>
              <th
                className="cursor-pointer px-6 py-3"
                onClick={() => handleSort("code")}
              >
                <div className="flex items-center gap-1">
                  <span>Service Code</span>
                </div>
              </th>
              <th
                className="cursor-pointer px-4 py-3"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center gap-1">
                  <span>Service Name</span>
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
                <div className="flex items-center gap-1">
                  <span>Department</span>
                  <span className="material-symbols-outlined text-[15px] opacity-70"></span>
                </div>
              </th>
              <th className="px-4 py-3">
                <div className="flex items-center gap-1">
                  <span>Service Lead</span>
                  <span className="material-symbols-outlined text-[15px] opacity-70"></span>
                </div>
              </th>

              <th
                className="cursor-pointer px-4 py-3"
                onClick={() => handleSort("tickets")}
              >
                <div className="flex items-center gap-1">
                  <span>Active Tickets</span>
                  <span className="material-symbols-outlined text-[15px] opacity-70">
                    {sortField === "tickets"
                      ? sortAsc
                        ? "arrow_drop_up"
                        : "arrow_drop_down"
                      : "unfold_more"}
                  </span>
                </div>
              </th>
              <th className="px-6 py-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {paginated.map((srv) => (
              <tr
                key={srv.id}
                className="group transition-colors hover:bg-indigo-50/40"
              >
                <td className="px-6 py-3.5 font-mono font-bold whitespace-nowrap text-slate-500">
                  {srv.code}
                </td>
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <div>
                    <span className="block font-bold text-slate-900 transition-colors group-hover:text-indigo-600">
                      {srv.name}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-slate-400">
                      corporate_fare
                    </span>
                    <span className="font-semibold text-slate-800">
                      {srv.department}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3.5 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-slate-400">
                      person
                    </span>
                    <span className="font-semibold text-slate-800">
                      {srv.lead}
                    </span>
                  </div>
                </td>

                <td className="px-4 py-3.5 whitespace-nowrap text-slate-800">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[13px] text-slate-400">
                      confirmation_number
                    </span>
                    {srv.activeTickets} Tickets
                  </span>
                </td>
                <td className="px-6 py-3.5 text-left whitespace-nowrap">
                  <button
                    onClick={() => onViewService(srv.id)}
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

      <TablePagination
        totalItems={filtered.length}
        currentPage={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        pageSizeOptions={[5, 10]}
      />
    </div>
  );
};
