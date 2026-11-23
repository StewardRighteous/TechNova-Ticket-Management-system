import React, { useState } from "react";
import type { Employee } from "../../types/barrel";
import { ComboboxFilter, NumericPagination, StaffAvatar, TableSearch } from "../common/barrel";

interface EmployeeTableProps {
  employees: Employee[];
  activeRoleId: string;
  onViewEmployee: (employeeId: string) => void;
  onCreateNew?: () => void;
}

export const EmployeeTable: React.FC<EmployeeTableProps> = ({
  employees,
  activeRoleId,
  onViewEmployee,
  onCreateNew,
}) => {
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [locationFilter, setLocationFilter] = useState<string[]>([]);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);

  const filtered = employees.filter((e) => {
    if (roleFilter !== "all" && e.role !== roleFilter) return false;
    if (statusFilter !== "all" && e.status !== statusFilter) return false;
    if (
      locationFilter.length &&
      !locationFilter.includes(e.locationId || "Unassigned")
    )
      return false;
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

  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);
  React.useEffect(() => {
    setPage((current) =>
      Math.min(current, Math.max(1, Math.ceil(filtered.length / pageSize))),
    );
  }, [filtered.length, pageSize]);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="bg-slate-900 px-5 py-5 text-white sm:px-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div>
            <h2 className="text-lg font-bold tracking-tight">All Employees</h2>
            <p className="mt-1 text-xs text-slate-300">
              Manage your team and availability.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 lg:w-[min(100%,26rem)]">
            {[
              [
                "TOTAL MEMBERS",
                employees.length,
                "border-blue-400/30 bg-blue-500/15 text-blue-200",
              ],
              [
                "AVAILABLE",
                employees.filter((employee) => employee.status === "Available")
                  .length,
                "border-emerald-400/30 bg-emerald-500/15 text-emerald-200",
              ],
              [
                "BUSY",
                employees.filter((employee) => employee.status === "Busy")
                  .length,
                "border-amber-400/30 bg-amber-500/15 text-amber-200",
              ],
              [
                "OFF SHIFT",
                employees.filter((employee) => employee.status === "Off Shift")
                  .length,
                "border-slate-400/30 bg-slate-500/15 text-slate-200",
              ],
            ].map(([label, count, tone]) => (
              <div
                key={label}
                className={`rounded-lg border px-2 py-1.5 text-center ${tone}`}
              >
                <div className="text-[9px] font-bold tracking-wide">
                  {label}
                </div>
                <div className="mt-0.5 text-lg leading-none font-bold">
                  {count}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2.5 border-b border-slate-200 bg-white px-5 py-3 sm:px-6">
        <TableSearch id="employee-search" value={search} onChange={(value) => { setSearch(value); setPage(1); }} placeholder="Search employees by name, role, or email..." aria-label="Search employees by name, role, or email" className="min-w-52 max-w-[480px] flex-1" />
        <div className="ml-auto flex flex-wrap items-center justify-end gap-2.5">
          <ComboboxFilter
            label="Location"
            selectedValues={locationFilter}
            onChange={(v) => {
              setLocationFilter(v);
              setPage(1);
            }}
            options={[
              ...new Set(employees.map((e) => e.locationId || "Unassigned")),
            ].map((v) => ({ value: v, label: v }))}
          />
          <ComboboxFilter
            label="Role"
            singleSelect
            selectedValues={roleFilter === "all" ? [] : [roleFilter]}
            onChange={(v) => {
              setRoleFilter(v[0] || "all");
              setPage(1);
            }}
            options={[...new Set(employees.map((e) => e.role))].map((v) => ({
              value: v,
              label:
                {
                  support_agent: "Support Agent",
                  senior_support: "Senior Support",
                  development_team: "Development Team",
                  qa: "QA & Test",
                  account_manager: "Account Manager",
                  operations_manager: "Operations Manager",
                  management: "Management",
                }[v] || v,
            }))}
          />
          <ComboboxFilter
            label="Status"
            singleSelect
            selectedValues={statusFilter === "all" ? [] : [statusFilter]}
            onChange={(values) => {
              setStatusFilter(values[0] || "all");
              setPage(1);
            }}
            options={["Available", "Busy", "Off Shift"].map((value) => ({
              value,
              label: value,
            }))}
          />
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
              <th className="px-5 py-2.5">Staff Member</th>
              <th className="px-4 py-2.5">
                <span> Staff Role </span>
              </th>
              <th className="px-4 py-2.5">Email</th>
              <th className="px-4 py-2.5">
                <span>Phone</span>
              </th>
              <th className="px-4 py-2.5">
                <span>Status</span>
              </th>
              <th className="px-5 py-2.5 text-left">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {paginated.map((emp) => {
              const isCurrent = emp.role === activeRoleId;

              return (
                <tr
                  key={emp.id}
                  className={`group cursor-pointer transition-colors hover:bg-teal-50/50 ${selectedEmployeeId === emp.id ? "bg-teal-50" : ""}`}
                  onClick={() => setSelectedEmployeeId(emp.id)}
                  onDoubleClick={() => onViewEmployee(emp.id)}
                >
                  <td className="px-5 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-teal-600 text-xs font-bold text-white shadow-sm">
                        <StaffAvatar src={emp.avatar} alt={`${emp.name} profile`} sizeClassName="h-8 w-8" />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-slate-900 group-hover:text-teal-700">
                            {emp.name}
                          </span>
                          {isCurrent && (
                            <span className="rounded bg-teal-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
                              YOU
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-break-spaces">
                    <span className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-800">
                      <span className="material-symbols-outlined text-[15px] text-slate-400">
                        badge
                      </span>
                      {emp.roleTitle}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-[11px] whitespace-nowrap text-slate-800">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px] text-slate-400">
                        email
                      </span>
                      {emp.email}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[11px] whitespace-nowrap text-slate-800">
                    <div className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[15px] text-slate-400">
                        phone
                      </span>
                      {emp.phone}
                    </div>
                  </td>

                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-semibold ${
                        emp.status === "Available"
                          ? "border border-emerald-300 bg-emerald-50 text-emerald-800"
                          : emp.status === "Busy"
                            ? "border border-amber-300 bg-amber-50 text-amber-800"
                            : "border border-slate-300 bg-slate-50 text-slate-700"
                      }`}
                    >
                      {emp.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-left whitespace-nowrap">
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onViewEmployee(emp.id);
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
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-5 py-12 text-center text-sm text-slate-500"
                >
                  {employees.length === 0
                    ? "No employees available."
                    : "No matching employees. Try adjusting your search or filters."}
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
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        pageSizeOptions={[10, 25, 50]}
      />
    </div>
  );
};
