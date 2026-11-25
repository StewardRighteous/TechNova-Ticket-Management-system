import React, { useState } from "react";
import type { Ticket, InboundChannel } from "../../types/barrel";
import { Button, DataTable, getTablePageRows, Icon, TableBody, TableCell, TableHead, TableHeader, TableRow,
  ChannelIcon,
  PriorityBadge,
  StatusBadge,
  TableHeaderSection,
  TableValue,
} from "../../ui/barrel";
import { DashboardChannelFilters } from "./DashboardChannelFilters";

interface DashboardTicketTableProps {
  tickets: Ticket[];
  onSelectTicket: (ticketId: string) => void;
  onExploreAll: () => void;
}

export const DashboardTicketTable: React.FC<DashboardTicketTableProps> = ({
  tickets,
  onSelectTicket,
  onExploreAll,
}) => {
  const [search, setSearch] = useState("");
  const [channelFilter, setChannelFilter] = useState<"all" | InboundChannel>(
    "all",
  );
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

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

  const paginated = getTablePageRows(filtered, page, pageSize);

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

      <DataTable
        className="border-collapse"
        rowCount={filtered.length}
        scroll
        pagination={{ currentPage: page, pageSize, onPageChange: setPage, onPageSizeChange: setPageSize }}
      >
        <TableHead tone="inverse">
          <TableRow>
            <TableHeader density="edge">Ticket</TableHeader>
            <TableHeader density="narrow">Channel</TableHeader>
            <TableHeader density="narrow">Client</TableHeader>
            <TableHeader density="narrow">Incident</TableHeader>
            <TableHeader density="narrow">Priority</TableHeader>
            <TableHeader density="narrow">Assignee</TableHeader>
            <TableHeader density="narrow">Status</TableHeader>
            <TableHeader density="edge">Action</TableHeader>
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
                <ChannelIcon channel={t.channel} />
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
              <TableCell density="narrow" className="whitespace-nowrap text-[11px] font-medium text-slate-700">
                <TableValue icon="person">{t.assignedToName}</TableValue>
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
  );
};
