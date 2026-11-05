import React, { useState } from "react";
import type { Employee } from "../../types";
import { TablePagination, TableHeaderSection } from "../common";

interface EmployeeTableProps {
  employees: Employee[];
  activeRoleId: string;
  onViewEmployee: (employeeId: string) => void;
}

type SortField = "name" | "role" | "capacity" | "status";

export const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  activeRoleId,
  onViewEmployee,
}) => {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
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

  const filtered = employees.filter((e) => {
    if (roleFilter !== "all" && e.role !== roleFilter) return false;
    if (statusFilter !== "all" && e.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        e.name.toLowerCase().includes(q) ||
        e.roleTitle.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    if (sortField === "name") cmp = a.name.localeCompare(b.name);
    else if (sortField === "role") cmp = a.roleTitle.localeCompare(b.roleTitle);
    else if (sortField === "capacity")
      cmp =
        a.activeTicketsCount / a.capacityMax -
        b.activeTicketsCount / b.capacityMax;
    else if (sortField === "status") cmp = a.status.localeCompare(b.status);
    return sortAsc ? cmp : -cmp;
  });

  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <TableHeaderSection
        title="Employees List"
        searchQuery={search}
        onSearchChange={(s) => {
          setSearch(s);
          setPage(1);
        }}
        searchPlaceholder="Filter engineer name or role..."
      >
        <select
          value={roleFilter}
          onChange={(e) => {
            setRoleFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none"
        >
          <option value="all">All Roles</option>
          <option value="support_agent">Support Agent</option>
          <option value="senior_support">Senior Support</option>
          <option value="development_team">Dev Team</option>
          <option value="qa">QA & Test</option>
          <option value="account_manager">Account Manager</option>
          <option value="operations_manager">Operations Manager</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-700 outline-none"
          aria-label="Filter employees by status"
        >
          <option value="all">All Status</option>
          <option value="Available">Available</option>
          <option value="Busy">Busy</option>
          <option value="Off Shift">Off Shift</option>
        </select>
      </TableHeaderSection>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead className="bg-slate-900 text-[11px] font-semibold tracking-wider text-white uppercase select-none">
            <tr>
              <th
                className="flex cursor-pointer items-center gap-1 px-6 py-3"
                onClick={() => handleSort("name")}
              >
                <span>Staff Member</span>
                <span className="material-symbols-outlined text-[15px] opacity-70">
                  {sortField === "name"
                    ? sortAsc
                      ? "arrow_drop_up"
                      : "arrow_drop_down"
                    : "unfold_more"}
                </span>
              </th>
              <th className="px-4 py-3">
                <span>Role & Title</span>
              </th>
              <th className="px-4 py-3">Direct Email</th>
              <th className="px-4 py-3">
                <span>Status</span>
              </th>
              <th className="px-6 py-3 text-left">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {paginated.map((emp) => {
              const isCurrent = emp.role === activeRoleId;

              return (
                <tr
                  key={emp.id}
                  className="group transition-colors hover:bg-indigo-50/40"
                >
                  <td className="px-6 py-3.5 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-bold text-white shadow-sm">
                        <span className="material-symbols-outlined text-[17px]">
                          {emp.avatar}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900">
                            {emp.name}
                          </span>
                          {isCurrent && (
                            <span className="py-0.2 rounded bg-indigo-600 px-1.5 text-[9px] font-bold text-white">
                              YOU
                            </span>
                          )}
                        </div>
                        <span className="font-mono text-[11px] text-slate-400">
                          {emp.phone}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span className="rounded-md border border-indigo-200 bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-700">
                      {emp.roleTitle}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 font-mono text-[11px] whitespace-nowrap text-slate-600">
                    {emp.email}
                  </td>

                  <td className="px-4 py-3.5 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                        emp.status === "Available"
                          ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border border-amber-200 bg-amber-50 text-amber-700"
                      }`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full ${emp.status === "Available" ? "bg-emerald-500" : "bg-amber-500"}`}
                      ></span>
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-right whitespace-nowrap">
                    <button
                      onClick={() => onViewEmployee(emp.id)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 shadow-sm transition-all hover:bg-indigo-600 hover:text-white"
                    >
                      <span>View</span>
                      <span className="material-symbols-outlined text-[15px]">
                        visibility
                      </span>
                    </button>
                  </td>
                </tr>
              );
            })}
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
