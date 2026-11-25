import { useTicketStore } from "../../store/barrel";
import React, { useState } from "react";
import type { Employee } from "../../types/barrel";
import { CategoryBadge, TableValue, ClearTableFiltersButton, TableRefreshButton, CallToAction, TableToolbar, Button, DataTable, getTablePageRows, Heading, Icon, TableBody, TableCell, TableHead, TableHeader, TableRow, ComboboxFilter, StaffAvatar, TableSearch } from "../../ui/barrel";

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
  const addToast = useTicketStore((state) => state.addToast);
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

  const paginated = getTablePageRows(filtered, page, pageSize);
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
            <Heading variant="plain" className="text-lg font-bold tracking-tight">All Employees</Heading>
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
      <DataTable rowCount={filtered.length} className="border-collapse"
        scroll
        toolbar={
          <TableToolbar>
            <TableSearch id="employee-search" value={search} onChange={(value) => { setSearch(value); setPage(1); }} placeholder="Search employees by name, role, or email..." aria-label="Search employees by name, role, or email" className="min-w-52 max-w-[480px] flex-1" />
            <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
              <ComboboxFilter hideClear
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
              <ComboboxFilter hideClear
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
              <ComboboxFilter hideClear
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

              {(locationFilter.length > 0 || roleFilter !== "all" || statusFilter !== "all") && <ClearTableFiltersButton onClear={() => { setLocationFilter([]); setRoleFilter("all"); setStatusFilter("all"); setPage(1); }} />}
              <TableRefreshButton onRefresh={() => addToast("Employees refreshed", "success")} />
              {onCreateNew && (
              <CallToAction icon="add" onClick={onCreateNew} className="h-8 shrink-0 px-3 py-0 text-xs">New Employee</CallToAction>
            )}
            </div>
          </TableToolbar>
        }
        pagination={{ currentPage: page, pageSize, onPageChange: setPage, onPageSizeChange: setPageSize }}
      >
        <TableHead>
          <TableRow>
            <TableHeader density="edge">Staff Member</TableHeader>
            <TableHeader>
              <span> Staff Role </span>
            </TableHeader>
            <TableHeader>Email</TableHeader>
            <TableHeader>
              <span>Phone</span>
            </TableHeader>
            <TableHeader>
              <span>Status</span>
            </TableHeader>
            <TableHeader density="edge">Action</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody className="bg-white">
          {paginated.map((emp) => {
            const isCurrent = emp.role === activeRoleId;

            return (
              <TableRow selected={selectedEmployeeId === emp.id}
                key={emp.id}

                onSelect={() => setSelectedEmployeeId(emp.id)}
                onOpen={() => onViewEmployee(emp.id)}
              >
                <TableCell density="edge" className="whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-teal-600 text-xs font-bold text-white shadow-sm">
                      <StaffAvatar src={emp.avatar} alt={`${emp.name} profile`} sizeClassName="h-8 w-8" />
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="cursor-text font-bold text-slate-900 group-hover:text-teal-700">
                          {emp.name}
                        </span>
                        {isCurrent && (
                          <span className="cursor-text rounded bg-teal-600 px-1.5 py-0.5 text-[9px] font-bold text-white">
                            YOU
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="whitespace-nowrap font-semibold text-slate-800">
                  <TableValue icon="badge">{emp.roleTitle}</TableValue>
                </TableCell>

                <TableCell className="text-[11px] whitespace-nowrap text-slate-800">
                  <TableValue icon="mail">{emp.email}</TableValue>
                </TableCell>
                <TableCell className="text-[11px] whitespace-nowrap text-slate-800">
                  <TableValue icon="call">{emp.phone}</TableValue>
                </TableCell>

                <TableCell className="whitespace-nowrap">
                  <CategoryBadge variant="status" category={emp.status} />
                </TableCell>
                <TableCell density="edge" className="text-left whitespace-nowrap">
                  <Button tone="plain"
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onViewEmployee(emp.id);
                    }}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-teal-700 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-teal-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                  >
                    <Icon className="text-[15px]">
                      visibility
                    </Icon>
                    <span>View</span>
                  </Button>
                </TableCell>
              </TableRow>
            );
          })}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell density="plain"
                colSpan={6}
                className="px-5 py-12 text-center text-sm text-slate-500"
              >
                {employees.length === 0
                  ? "No employees available."
                  : "No matching employees. Try adjusting your search or filters."}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </DataTable>
    </div>
  );
};
