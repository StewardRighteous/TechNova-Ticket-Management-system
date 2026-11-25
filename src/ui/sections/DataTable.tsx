import { useState, type ComponentPropsWithRef, type ReactNode } from "react";
import { Button } from "../atoms/Button";
import { Icon } from "../atoms/Icon";
import { NumericPagination, type NumericPaginationProps } from "../molecules/NumericPagination";
import { getTablePageRows, minimumTableFooterRows } from "../molecules/tablePagination";

type TableLayoutProps = Omit<ComponentPropsWithRef<"table">, "children"> & {
  toolbar?: ReactNode;
  scroll?: boolean;
  columnWidths?: readonly string[];
};

type TableProps = TableLayoutProps & {
  children: ReactNode;
  rowCount: number;
  pagination: Omit<NumericPaginationProps, "totalItems">;
};

export function DataTable({
  className = "",
  children,
  rowCount,
  toolbar,
  pagination,
  scroll,
  columnWidths,
  ...props
}: TableProps) {
  const table = (
    <table {...props} className={`w-full text-left text-xs ${className}`}>
      {columnWidths && (
        <colgroup>
          {columnWidths.map((width, index) => (
            <col key={index} style={{ width }} />
          ))}
        </colgroup>
      )}
      {children}
    </table>
  );
  return (
    <>
      {toolbar}
      {scroll ? <div className="overflow-x-auto">{table}</div> : table}
      {rowCount >= minimumTableFooterRows && (
        <NumericPagination {...pagination} totalItems={rowCount} />
      )}
    </>
  );
}

type PaginatedTableProps<Row> = TableLayoutProps & {
  rows: readonly Row[];
  children: (pageRows: readonly Row[]) => ReactNode;
};

export function PaginatedDataTable<Row>({ rows, children, ...props }: PaginatedTableProps<Row>) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  return (
    <DataTable
      {...props}
      rowCount={rows.length}
      pagination={{ currentPage: page, pageSize, onPageChange: setPage, onPageSizeChange: setPageSize }}
    >
      {children(getTablePageRows(rows, page, pageSize))}
    </DataTable>
  );
}

export function ClearTableFiltersButton({ onClear }: { onClear: () => void }) {
  return <Button type="button" tone="plain" onClick={onClear} aria-label="Clear filters" title="Clear filters" className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"><Icon aria-hidden="true" className="text-[14px]">filter_alt_off</Icon></Button>;
}

export function TableRefreshButton({ onRefresh }: { onRefresh: () => void }) {
  return (
    <Button type="button" tone="plain" onClick={onRefresh} className="inline-flex h-7 items-center gap-1.5 rounded-md border border-slate-200 px-2 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-teal-600">
      <Icon aria-hidden="true" className="text-sm">refresh</Icon>
      Refresh
    </Button>
  );
}

const headTones = {
  standard: "text-[11px] font-bold tracking-wider text-slate-500 uppercase",
  compact: "text-[10px] font-bold tracking-wide text-slate-500 uppercase",
  inverse: "text-[11px] font-semibold tracking-wider text-slate-500 uppercase",
  plain: "",
};

export function TableHead({
  tone = "standard",
  className = "",
  ...props
}: ComponentPropsWithRef<"thead"> & {
  tone?: keyof typeof headTones;
}) {
  return <thead {...props} className={`bg-slate-100 ${headTones[tone]} ${className}`} />;
}

export function TableBody({ className = "", ...props }: ComponentPropsWithRef<"tbody">) {
  return <tbody {...props} className={`divide-y divide-slate-100 ${className}`} />;
}

type TableRowProps = Omit<ComponentPropsWithRef<"tr">, "onSelect"> & {
  selected?: boolean;
  onSelect?: () => void;
  onOpen?: () => void;
};

function isRowTarget(target: EventTarget, row: HTMLTableRowElement) {
  return (
    target instanceof Element &&
    row.contains(target) &&
    !target.closest("button, a, input, label, [role=button]")
  );
}

export function TableRow({
  selected,
  onSelect,
  onOpen,
  onClick,
  onDoubleClick,
  onKeyDown,
  className = "",
  ...props
}: TableRowProps) {
  const interactive =
    selected === undefined
      ? ""
      : `group cursor-pointer transition-colors hover:bg-indigo-50/40 focus-visible:outline-2 focus-visible:outline-brand-teal ${selected ? "bg-indigo-50" : ""}`;
  return (
    <tr
      {...props}
      data-selected={selected}
      className={`${interactive} ${className}`}
      onClick={
        onSelect
          ? (event) => {
              if (isRowTarget(event.target, event.currentTarget)) onSelect();
            }
          : onClick
      }
      onDoubleClick={
        onOpen
          ? (event) => {
              if (isRowTarget(event.target, event.currentTarget)) onOpen();
            }
          : onDoubleClick
      }
      onKeyDown={
        onOpen
          ? (event) => {
              if (event.target !== event.currentTarget || (event.key !== "Enter" && event.key !== " "))
                return;
              event.preventDefault();
              onOpen();
            }
          : onKeyDown
      }
    />
  );
}

const columnSpacing = {
  standard: "px-4",
  narrow: "px-3",
  edge: "px-5",
  snug: "px-2.5",
  compact: "px-2",
  plain: "",
};

type CellDensity = { density?: keyof typeof columnSpacing };

export function TableHeader({
  density = "standard",
  className = "",
  scope = "col",
  ...props
}: ComponentPropsWithRef<"th"> & CellDensity) {
  return <th {...props} scope={scope} className={`${columnSpacing[density]} py-1.5 text-left align-middle ${className}`} />;
}

export function SortableTableHeader({ children, density, direction, onSort }: CellDensity & {
  children: string;
  direction?: "ascending" | "descending";
  onSort: () => void;
}) {
  const icon = direction === "ascending" ? "arrow_upward" : direction === "descending" ? "arrow_downward" : "unfold_more";

  return (
    <TableHeader density={density} aria-sort={direction}>
      <Button type="button" tone="plain" onClick={onSort} className="inline-flex items-center gap-1 rounded-sm text-left uppercase hover:text-teal-700">
        {children}
        <Icon aria-hidden="true" className="text-sm leading-none">{icon}</Icon>
      </Button>
    </TableHeader>
  );
}

export function TableCell({
  density = "standard",
  className = "",
  ...props
}: ComponentPropsWithRef<"td"> & CellDensity) {
  const rowSpacing = density === "compact" ? "py-2" : "py-2.5";
  const spacing = density === "plain" ? "" : `${columnSpacing[density]} ${rowSpacing}`;
  return <td {...props} className={`${spacing} ${className}`} />;
}

export function TableToolbar({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-white px-4 py-3 sm:px-5">
      {children}
    </div>
  );
}
