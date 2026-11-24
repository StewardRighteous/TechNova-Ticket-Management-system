import React, { useState } from "react";
import type { Ticket, InboundChannel } from "../../types/barrel";
import { SortableTableHeader, Button, DataTable, Icon, TableBody, TableCell, TableHead, TableHeader, TableRow,
  ChannelBadge,
  PriorityBadge,
  StatusBadge,
  NumericPagination,
  TableHeaderSection,
} from "../../ui/barrel";
import { DashboardChannelFilters } from "./DashboardChannelFilters";

interface DashboardTicketTableProps {
  tickets: Ticket[];
  onSelectTicket: (ticketId: string) => void;
  onExploreAll: () => void;
}

type SortField = "code" | "company" | "title" | "priority" | "status";

export const DashboardTicketTable: React.FC<DashboardTicketTableProps> = ({
  tickets,
  onSelectTicket,
  onExploreAll,
}) => {
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState<"all" | InboundChannel>(
    "all",
  );
  const [sortField, setSortField] = useState<SortField>("priority");
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const filtered = tickets.filter((t) => {
    if (channelFilter !== "all" && t.channel !== channelFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        t.code.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.companyName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    if (sortField === "code") cmp = a.code.localeCompare(b.code);
    else if (sortField === "company")
      cmp = a.companyName.localeCompare(b.companyName);
    else if (sortField === "title") cmp = a.title.localeCompare(b.title);
    else if (sortField === "priority")
      cmp = a.priority.localeCompare(b.priority);
    else if (sortField === "status") cmp = a.status.localeCompare(b.status);
    return sortAsc ? cmp : -cmp;
  });

  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-lg">
      <TableHeaderSection
        title="Active Tickets"
        searchQuery={search}
        onSearchChange={(s) => {
          setSearch(s);
          setPage(1);
        }}
        searchPlaceholder="Quick filter tickets..."
      >
        <DashboardChannelFilters
          channelFilter={channelFilter}
          setChannelFilter={(c) => {
            setChannelFilter(c);
            setPage(1);
          }}
          onExploreAll={onExploreAll}
        />
      </TableHeaderSection>

      <div className="overflow-x-auto">
        <DataTable className="border-collapse">
          <TableHead tone="inverse">
            <TableRow>
              <SortableTableHeader density="edge" onSort={() => handleSort("code")} direction={sortField === "code" ? (sortAsc ? "ascending" : "descending") : undefined}>Ticket</SortableTableHeader>
              <TableHeader density="narrow">Channel</TableHeader>
              <SortableTableHeader density="narrow" onSort={() => handleSort("company")} direction={sortField === "company" ? (sortAsc ? "ascending" : "descending") : undefined}>Client</SortableTableHeader>
              <SortableTableHeader density="narrow" onSort={() => handleSort("title")} direction={sortField === "title" ? (sortAsc ? "ascending" : "descending") : undefined}>Incident</SortableTableHeader>
              <SortableTableHeader density="narrow" onSort={() => handleSort("priority")} direction={sortField === "priority" ? (sortAsc ? "ascending" : "descending") : undefined}>Priority</SortableTableHeader>
              <TableHeader density="narrow">Assignee</TableHeader>
              <SortableTableHeader density="narrow" onSort={() => handleSort("status")} direction={sortField === "status" ? (sortAsc ? "ascending" : "descending") : undefined}>Status</SortableTableHeader>
              <TableHeader density="edge" className="text-left">Action</TableHeader>
            </TableRow>
          </TableHead>
          <TableBody className="bg-white">
            {paginated.map((t) => (
              <TableRow
                key={t.id}
                className="group transition-colors hover:bg-indigo-50/40"
              >
                <TableCell density="edge" className="font-mono font-bold whitespace-nowrap text-indigo-700">
                  {t.code}
                </TableCell>
                <TableCell density="narrow" className="whitespace-nowrap">
                  <ChannelBadge channel={t.channel} showText={false} />
                </TableCell>
                <TableCell density="narrow" className="font-semibold whitespace-nowrap text-slate-800">
                  {t.companyName}
                </TableCell>
                <TableCell density="narrow" className="max-w-xs">
                  <span className="block truncate font-bold text-slate-900 transition-colors group-hover:text-indigo-600">
                    {t.title}
                  </span>
                </TableCell>
                <TableCell density="narrow" className="whitespace-nowrap">
                  <PriorityBadge priority={t.priority} />
                </TableCell>
                <TableCell density="narrow" className="whitespace-nowrap text-slate-700">
                  <div className="flex items-center gap-1 text-[11px]">
                    <Icon className="text-[14px] text-slate-400">
                      person
                    </Icon>
                    <span className="font-medium">{t.assignedToName}</span>
                  </div>
                </TableCell>
                <TableCell density="narrow" className="whitespace-nowrap">
                  <StatusBadge status={t.status} />
                </TableCell>
                <TableCell density="edge" className="whitespace-nowrap">
                  <Button tone="plain"
                    onClick={() => onSelectTicket(t.id)}
                    className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1 text-xs font-bold text-indigo-700 shadow-sm transition-all hover:bg-indigo-600 hover:text-white"
                  >
                    <Icon className="text-[14px]">
                      visibility
                    </Icon>
                    <span>View</span>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </DataTable>
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
