import type { ComponentPropsWithRef, ReactNode } from "react";
import { Button } from "../atoms/Button";
import { Icon } from "../atoms/Icon";

type TableProps = ComponentPropsWithRef<"table"> & {
  toolbar?: ReactNode;
  pagination?: ReactNode;
  scroll?: boolean;
  columnWidths?: readonly string[];
};

export function DataTable({
  className = "",
  children,
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
      {pagination}
    </>
  );
}

const headTones = {
  standard: "bg-white text-[11px] font-bold tracking-wider text-slate-700 uppercase",
  compact: "bg-slate-50 text-[10px] font-bold tracking-wide text-slate-500 uppercase",
  inverse: "bg-slate-900 text-[11px] font-semibold tracking-wider text-white uppercase",
  plain: "",
};

export function TableHead({
  tone = "standard",
  className = "",
  ...props
}: ComponentPropsWithRef<"thead"> & {
  tone?: keyof typeof headTones;
}) {
  return <thead {...props} className={`${headTones[tone]} ${className}`} />;
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

const cellSpacing = {
  standard: "px-4 py-2.5",
  narrow: "px-3 py-2.5",
  edge: "px-5 py-2.5",
  compact: "px-2 py-2",
  plain: "",
};

type CellDensity = { density?: keyof typeof cellSpacing };

export function TableHeader({
  density = "standard",
  className = "",
  scope = "col",
  ...props
}: ComponentPropsWithRef<"th"> & CellDensity) {
  return <th {...props} scope={scope} className={`${cellSpacing[density]} ${className}`} />;
}

export function TableCell({
  density = "standard",
  className = "",
  ...props
}: ComponentPropsWithRef<"td"> & CellDensity) {
  return <td {...props} className={`${cellSpacing[density]} ${className}`} />;
}

export function SortableTableHeader({
  direction,
  onSort,
  children,
  ...props
}: ComponentPropsWithRef<typeof TableHeader> & {
  direction?: "ascending" | "descending";
  onSort: () => void;
}) {
  return (
    <TableHeader {...props} aria-sort={direction}>
      <Button
        type="button"
        tone="plain"
        onClick={onSort}
        className="inline-flex items-center gap-1 whitespace-nowrap hover:text-teal-700"
      >
        {children}
        <Icon aria-hidden="true" className="text-[15px]">
          {direction === "ascending"
            ? "arrow_upward"
            : direction === "descending"
              ? "arrow_downward"
              : "unfold_more"}
        </Icon>
      </Button>
    </TableHeader>
  );
}

export function TableToolbar({ children }: { children: ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2.5 border-b border-slate-200 bg-white px-4 py-3 sm:px-5">
      {children}
    </div>
  );
}
