import { useTicketStore } from "../../store/barrel";
import React, { useState } from "react";
import type { Employee, ServiceLine } from "../../types/barrel";
import { TableValue, ClearTableFiltersButton, TableRefreshButton, CallToAction, TableToolbar, Button, DataTable, getTablePageRows, Heading, Icon, TableBody, TableCell, TableHead, TableHeader, TableRow, ComboboxFilter, StaffAvatar, TableSearch } from "../../ui/barrel";

interface ServiceTableProps {
  services: ServiceLine[];
  employees: Employee[];
  onViewService: (serviceId: string) => void;
  onCreateNew?: () => void;
  personal?: boolean;
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
  employees,
  onViewService,
  onCreateNew,
  personal = false,
  initialPage = 1,
  initialPageSize = 10,
  initialSearch = "",
  initialDepartmentFilter = [],
  initialStatusFilter = [],
  onTableStateChange,
}) => {
  const addToast = useTicketStore((state) => state.addToast);
  const [search, setSearch] = useState(initialSearch);
  const [departmentFilter, setDepartmentFilter] = useState(
    initialDepartmentFilter,
  );
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter);
  const [page, setPage] = useState<number>(initialPage);
  const [pageSize, setPageSize] = useState<number>(initialPageSize);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

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

  const avatarsByName = new Map(employees.map((employee) => [employee.name, employee.avatar]));
  const paginated = getTablePageRows(filtered, page, pageSize);
  React.useEffect(() => {
    setPage((current) =>
      Math.min(current, Math.max(1, Math.ceil(filtered.length / pageSize))),
    );
  }, [filtered.length, pageSize]);
  const departmentOptions = [
    ...new Set(services.map((service) => service.department)),
  ].map((value) => ({ value, label: value }));

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="bg-slate-900 px-5 py-5 text-white sm:px-6">
        <Heading variant="plain" className="text-lg font-bold tracking-tight">{personal ? "My Services" : "All Services"}</Heading>
        <p className="mt-1 text-xs text-slate-300">
          Browse and manage service lines.
        </p>
      </div>
      <DataTable rowCount={filtered.length} className="border-collapse"
        scroll
        toolbar={
          <TableToolbar>
            <TableSearch id="service-search" value={search} onChange={(value) => { setSearch(value); setPage(1); updateState({ search: value, page: 1 }); }} placeholder="Filter services or lead..." aria-label="Filter services or lead" className="min-w-52 max-w-[480px] flex-1" />
            <div className="ml-auto flex flex-wrap items-center justify-end gap-2">
              <ComboboxFilter hideClear
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
              {(departmentFilter.length > 0 || statusFilter.length > 0) && <ClearTableFiltersButton onClear={() => { setDepartmentFilter([]); setStatusFilter([]); setPage(1); updateState({ departmentFilter: [], statusFilter: [], page: 1 }); }} />}
              <TableRefreshButton onRefresh={() => addToast("Services refreshed", "success")} />

              {onCreateNew && (
              <CallToAction icon="add" onClick={onCreateNew} className="h-8 shrink-0 px-3 py-0 text-xs">New Service</CallToAction>
            )}
            </div>
          </TableToolbar>
        }
        pagination={{
          currentPage: page,
          pageSize,
          onPageChange: (value) => {
            setPage(value);
            updateState({ page: value });
          },
          onPageSizeChange: (value) => {
            setPageSize(value);
            setPage(1);
            updateState({ pageSize: value, page: 1 });
          },
        }}
      >
        <TableHead>
          <TableRow>
            <TableHeader density="edge">Service Code</TableHeader>
            <TableHeader>Service Name</TableHeader>
            <TableHeader>Department</TableHeader>
            <TableHeader>Service Lead</TableHeader>

            <TableHeader>Active Tickets</TableHeader>
            <TableHeader density="edge">Action</TableHeader>
          </TableRow>
        </TableHead>
        <TableBody className="bg-white">
          {paginated.map((srv) => (
            <TableRow selected={selectedServiceId === srv.id}
              key={srv.id}

              onSelect={() => setSelectedServiceId(srv.id)}
                onOpen={() => onViewService(srv.id)}
            >
              <TableCell density="edge" className="font-mono font-bold whitespace-nowrap text-slate-500">
                <span className="cursor-text">{srv.code}</span>
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <div className="flex items-center gap-2.5">
                  <span className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded-md bg-slate-100 text-slate-500">{srv.logo ? <img src={srv.logo} alt="" className="h-full w-full object-cover" /> : <Icon className="text-[18px]">{srv.code.startsWith("CLOUD") ? "cloud" : srv.code.startsWith("BIZ") ? "business" : srv.code.startsWith("SUPP") ? "support_agent" : srv.code.startsWith("SEC") ? "security" : "web"}</Icon>}</span>
                  <Button tone="plain"
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      onViewService(srv.id);
                    }}
                    className="block text-left font-bold text-slate-900 transition-colors group-hover:text-teal-700 focus-visible:outline-2 focus-visible:outline-teal-600"
                  >
                    {srv.name}
                  </Button>
                </div>
              </TableCell>
              <TableCell className="whitespace-nowrap font-semibold text-slate-800">
                <TableValue icon="corporate_fare">{srv.department}</TableValue>
              </TableCell>
              <TableCell className="whitespace-nowrap">
                <div className="flex items-center gap-1.5">
                  <StaffAvatar
                    key={avatarsByName.get(srv.lead)}
                    src={avatarsByName.get(srv.lead) ?? ""}
                    alt=""
                    sizeClassName="size-7 shrink-0"
                  />
                  <span className="cursor-text font-semibold text-slate-800">
                    {srv.lead}
                  </span>
                </div>
              </TableCell>

              <TableCell className="whitespace-nowrap text-slate-800">
                <TableValue icon="confirmation_number">{srv.activeTickets + " Tickets"}</TableValue>
              </TableCell>
              <TableCell density="edge" className="text-left whitespace-nowrap">
                <Button tone="plain"
                  onClick={(event) => {
                    event.stopPropagation();
                    onViewService(srv.id);
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
          ))}
          {filtered.length === 0 && (
            <TableRow>
              <TableCell density="plain"
                colSpan={6}
                className="px-5 py-12 text-center text-sm text-slate-500"
              >
                {services.length === 0
                  ? personal ? "No services are assigned to you." : "No services available."
                  : "No matching services. Try adjusting your search or filters."}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </DataTable>
    </div>
  );
};
