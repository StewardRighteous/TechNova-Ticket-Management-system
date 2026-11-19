import React, { useState } from "react";
import type { ServiceLine } from "../../types/barrel";
import { ComboboxFilter, NumericPagination } from "../common/barrel";

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

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  React.useEffect(() => {
    setPage((current) =>
      Math.min(current, Math.max(1, Math.ceil(filtered.length / pageSize))),
    );
  }, [filtered.length, pageSize]);
  const departmentOptions = [
    ...new Set(services.map((service) => service.department)),
  ].map((value) => ({ value, label: value }));
  const statusOptions = [
    ...new Set(services.map((service) => service.status)),
  ].map((value) => ({ value, label: value }));

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="bg-slate-900 px-5 py-5 text-white sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold tracking-tight">All Services</h2>
            <p className="mt-1 text-xs text-slate-300">
              Browse and manage service lines.
            </p>
          </div>
          <div className="rounded-xl border border-blue-400/30 bg-blue-500/15 px-4 py-2 text-center text-blue-200">
            <div className="text-[10px] font-bold tracking-wide">
              TOTAL SERVICES
            </div>
            <div className="mt-0.5 text-xl leading-none font-bold">
              {services.length}
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2.5 border-b border-slate-200 bg-white px-5 py-3 sm:px-6">
        <div className="relative max-w-xs min-w-60">
          <span
            aria-hidden="true"
            className="material-symbols-outlined absolute top-1/2 left-2.5 -translate-y-1/2 text-[17px] text-slate-500"
          >
            search
          </span>
          <input
            type="search"
            id="service-search"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
              updateState({ search: event.target.value, page: 1 });
            }}
            placeholder="Filter services or lead..."
            aria-label="Filter services or lead"
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pr-3 pl-8 text-sm text-slate-900 outline-none placeholder:text-slate-500 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
          />
        </div>
        <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
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
        {onCreateNew && (
          <button
            type="button"
            onClick={onCreateNew}
            className="flex shrink-0 items-center gap-1 rounded-lg bg-teal-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-700"
          >
            <span
              aria-hidden="true"
              className="material-symbols-outlined text-[16px]"
            >
              add
            </span>{" "}
            New
          </button>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead className="bg-white text-[11px] font-bold tracking-wider text-slate-700 uppercase select-none">
            <tr>
              <th className="px-5 py-2.5">
                <div className="flex items-center gap-1">
                  <span>Service Code</span>
                </div>
              </th>
              <th className="px-4 py-2.5">
                <div className="flex items-center gap-1">
                  <span>Service Name</span>
                </div>
              </th>
              <th className="px-4 py-2.5">
                <div className="flex items-center gap-1">
                  <span>Department</span>
                  <span className="material-symbols-outlined text-[15px] opacity-70"></span>
                </div>
              </th>
              <th className="px-4 py-2.5">
                <div className="flex items-center gap-1">
                  <span>Service Lead</span>
                  <span className="material-symbols-outlined text-[15px] opacity-70"></span>
                </div>
              </th>

              <th
                className="px-4 py-2.5"
              >
                <div className="flex items-center gap-1">
                  <span>Active Tickets</span>
                </div>
              </th>
              <th className="px-5 py-2.5 text-left">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {paginated.map((srv) => (
              <tr
                key={srv.id}
                className="group cursor-pointer transition-colors hover:bg-teal-50/50"
                onClick={() => onViewService(srv.id)}
              >
                <td className="px-5 py-3 font-mono font-bold whitespace-nowrap text-slate-500">
                  {srv.code}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div>
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onViewService(srv.id);
                      }}
                      className="block text-left font-bold text-slate-900 transition-colors group-hover:text-teal-700 focus-visible:outline-2 focus-visible:outline-teal-600"
                    >
                      {srv.name}
                    </button>
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
                <td className="px-5 py-3 text-left whitespace-nowrap">
                  <button
                    onClick={(event) => {
                      event.stopPropagation();
                      onViewService(srv.id);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-teal-50 px-3 py-1.5 text-xs font-bold text-teal-800 shadow-sm transition-all hover:bg-teal-600 hover:text-white"
                  >
                    <span className="material-symbols-outlined text-[15px]">
                      visibility
                    </span>
                    <span>View</span>
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-12 text-center text-sm text-slate-500"
                >
                  {services.length === 0
                    ? "No services available."
                    : "No matching services. Try adjusting your search or filters."}
                </td>
              </tr>
            )}
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
        pageSizeOptions={[5, 10, 20, 25, 50]}
      />
    </div>
  );
};
