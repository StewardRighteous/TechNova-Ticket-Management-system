import { useState } from "react";
import type { TicketPriority, TicketStatus } from "../../types/barrel";
import { ActionLink } from "../atoms/ActionLink";
import { CategoryBadge } from "../atoms/CategoryBadge";
import { PriorityBadge, StatusBadge } from "../atoms/StatusBadge";
import { TableValue } from "../molecules/TableValue";
import { getTablePageRows } from "../molecules/tablePagination";
import { DataTable, SortableTableHeader, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./DataTable";

interface TicketSummaryRow {
  id: string;
  code: string;
  href: string;
  title: string;
  priority: TicketPriority;
  companyName: string;
  status: TicketStatus;
  timeAgo: string;
  updatedTimestamp: number | undefined;
  slaDeadline: string;
  slaRisk: string;
  slaRemainingMinutes: number | undefined;
}

const columns = ["Ticket ID", "Subject", "Priority", "Company", "Status", "Updated", "SLA"];
type SortField = "Updated" | "SLA";
type SortDirection = "ascending" | "descending";

function compareSortValues(left: number | undefined, right: number | undefined, direction: SortDirection) {
  if (left === right) return 0;
  if (left === undefined) return 1;
  if (right === undefined) return -1;
  return direction === "ascending" ? left - right : right - left;
}

export function TicketSummaryTable({ rows, emptyMessage }: {
  rows: readonly TicketSummaryRow[];
  emptyMessage: string;
}) {
  const [sort, setSort] = useState<{ field: SortField; direction: SortDirection }>();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const sortKey = sort?.field === "Updated" ? "updatedTimestamp" : "slaRemainingMinutes";
  const sortedRows = sort ? [...rows].sort((left, right) => compareSortValues(left[sortKey], right[sortKey], sort.direction)) : rows;
  const pageRows = getTablePageRows(sortedRows, page, pageSize);

  function sortBy(field: SortField) {
    const firstDirection = field === "Updated" ? "descending" : "ascending";
    setSort({
      field,
      direction: sort?.field === field && sort.direction === firstDirection
        ? (firstDirection === "ascending" ? "descending" : "ascending")
        : firstDirection,
    });
    setPage(1);
  }

  return (
    <DataTable rowCount={rows.length} scroll className="min-w-[700px]"
      pagination={{ currentPage: page, pageSize, onPageChange: setPage, onPageSizeChange: setPageSize }}
    >
      <TableHead tone="compact">
        <TableRow>
          {columns.map((column) => column === "Updated" || column === "SLA" ? (
            <SortableTableHeader density="snug" key={column} direction={sort?.field === column ? sort.direction : undefined} onSort={() => sortBy(column)}>
              {column}
            </SortableTableHeader>
          ) : <TableHeader density="snug" key={column}>{column}</TableHeader>)}
        </TableRow>
      </TableHead>
      <TableBody>
        {pageRows.map((row) => (
          <TableRow key={row.id} className="hover:bg-slate-50/70">
            <TableCell density="snug" className="whitespace-nowrap">
              <ActionLink to={row.href} className="font-bold text-teal-700 hover:underline">{row.code}</ActionLink>
            </TableCell>
            <TableCell density="snug" className="max-w-56 truncate font-medium text-slate-700" title={row.title}>
              {row.title}
            </TableCell>
            <TableCell density="snug"><PriorityBadge priority={row.priority} /></TableCell>
            <TableCell density="snug" className="max-w-48 text-slate-600" title={row.companyName}>
              <TableValue icon="business">{row.companyName}</TableValue>
            </TableCell>
            <TableCell density="snug"><StatusBadge status={row.status} /></TableCell>
            <TableCell
              density="plain"
              className="whitespace-nowrap px-2.5 py-2.5 text-slate-500"
              title={row.updatedTimestamp === undefined ? undefined : new Date(row.updatedTimestamp).toLocaleString()}
            >
              <TableValue icon="schedule">{row.timeAgo}</TableValue>
            </TableCell>
            <TableCell density="snug" className="whitespace-nowrap text-slate-600">
              {row.slaDeadline ? <TableValue icon="timer">{row.slaDeadline}</TableValue> : <CategoryBadge variant="sla" category={row.slaRisk} />}
            </TableCell>
          </TableRow>
        ))}
        {!pageRows.length && (
          <TableRow>
            <TableCell density="plain" colSpan={columns.length} className="px-2.5 py-6 text-center text-slate-500">
              {emptyMessage}
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </DataTable>
  );
}
