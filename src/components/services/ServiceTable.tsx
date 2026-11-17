import React, { useState } from "react";
import type { ServiceLine } from "../../types/barrel";
import {
  ComboboxFilter,
  NumericPagination,
  TableHeaderSection,
} from "../common/barrel";

interface ServiceTableProps {
  services: ServiceLine[];
  onViewService: (serviceId: string) => void;
  onCreateNew?: () => void;
  initialPage?: number;
  initialPageSize?: number;
  initialSearch?: string;
  initialDepartmentFilter?: string[];
  initialStatusFilter?: string[];
  onTableStateChange?: (state: {
    page: number;
    pageSize: number;
    search: string;
    departmentFilter: string[];
    statusFilter: string[];
  }) => void;
}

type SortField = "name" | "code" | "lead" | "sla" | "tickets" | "uptime";

export const ServiceTable: React.FC<ServiceTableProps> = ({
  services,
  onViewService,
  onCreateNew,
  initialPage = 1,
  initialPageSize = 10,
  initialSearch = "",
  initialDepartmentFilter = [],
  initialStatusFilter = [],
  onTableStateChange,
}) => {
  const [search, setSearch] = useState(initialSearch);
  const [departmentFilter, setDepartmentFilter] = useState(
    initialDepartmentFilter,
  );
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
  const [sortField, setSortField] = useState<SortField>("name");
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [page, setPage] = useState<number>(initialPage);
  const [pageSize, setPageSize] = useState<number>(initialPageSize);

  const updateState = (
    next: Partial<{
      page: number;
      pageSize: number;
      search: string;
      departmentFilter: string[];
      statusFilter: string[];
    }>,
  ) => {
    onTableStateChange?.({
      page,
      pageSize,
      search,
      departmentFilter,
      statusFilter,
      ...next,
    });
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const filtered = services.filter((s) => {
    if (departmentFilter.length && !departmentFilter.includes(s.department))
      return false;
    if (statusFilter.length && !statusFilter.includes(s.status)) return false;
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
  const departmentOptions = [
    ...new Set(services.map((service) => service.department)),
  ].map((value) => ({ value, label: value }));
  const statusOptions = [
    ...new Set(services.map((service) => service.status)),
  ].map((value) => ({ value, label: value }));

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <TableHeaderSection
        title="All Services"
        searchQuery={search}
        onSearchChange={(value) => {
          setSearch(value);
          setPage(1);
          updateState({ search: value, page: 1 });
        }}
        searchPlaceholder="Filter services or lead..."
        onClick={onCreateNew}
        children={
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-6 py-3">
            <ComboboxFilter
              label="Department"
              options={departmentOptions}
              selectedValues={departmentFilter}
              onChange={(values) => {
                setDepartmentFilter(values);
                setPage(1);
                updateState({ departmentFilter: values, page: 1 });
              }}
              singleSelect
            />
            <ComboboxFilter
              label="Status"
              options={statusOptions}
              selectedValues={statusFilter}
              onChange={(values) => {
                setStatusFilter(values);
                setPage(1);
                updateState({ statusFilter: values, page: 1 });
              }}
              singleSelect
            />
            {departmentFilter.length || statusFilter.length ? (
              <button
                type="button"
                className="text-xs font-semibold text-slate-500 hover:text-slate-900"
                onClick={() => {
                  setDepartmentFilter([]);
                  setStatusFilter([]);
                  setPage(1);
                  updateState({
                    departmentFilter: [],
                    statusFilter: [],
                    page: 1,
                  });
                }}
              >
                Clear filters
              </button>
            ) : null}
          </div>
        }
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
                className="group cursor-pointer transition-colors hover:bg-indigo-50/40"
                onClick={() => onViewService(srv.id)}
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
                    onClick={(event) => {
                      event.stopPropagation();
                      onViewService(srv.id);
                    }}
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
        onPageChange={(value) => {
          setPage(value);
          updateState({ page: value });
        }}
        onPageSizeChange={(value) => {
          setPageSize(value);
          setPage(1);
          updateState({ pageSize: value, page: 1 });
        }}
        pageSizeOptions={[5, 10, 25]}
      />
    </div>
  );
};
