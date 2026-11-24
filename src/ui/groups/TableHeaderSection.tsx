import { Heading } from "../atoms/Heading";
import React from "react";
import { CallToAction } from "../molecules/CallToAction";
import { TableSearch } from "../molecules/TableSearch";

interface TableHeaderSectionProps {
  title: string;
  subtitle?: string;
  badgeText?: string;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  searchPlaceholder?: string;
  children?: React.ReactNode;
  onClick?: () => void; // segmented controls/filters on the right
  navy?: boolean;
}

export const TableHeaderSection: React.FC<TableHeaderSectionProps> = ({
  title,
  subtitle,
  badgeText,
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Search records...",
  onClick,
  children,
  navy = false,
}) => {
  const toolbarClass = navy
    ? "border-slate-900 bg-slate-900 text-white"
    : "border-slate-200 bg-white text-slate-900";
  return (
    <div className={`flex flex-col gap-3 rounded-t-2xl border border-b-0 p-4 ${toolbarClass}`}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Heading variant="plain" className={`text-base font-bold tracking-tight ${navy ? "text-white" : "text-slate-900"}`}>
              {title}
            </Heading>
            {badgeText && (
              <span className={`rounded-full border px-2 py-0.5 text-[11px] font-semibold ${navy ? "border-white/20 bg-white/10 text-white" : "border-indigo-200 bg-indigo-50 text-indigo-700"}`}>
                {badgeText}
              </span>
            )}
          </div>
          {subtitle && (
            <p className={`mt-1 text-sm leading-5 ${navy ? "text-slate-300" : "text-slate-600"}`}>{subtitle}</p>
          )}
        </div>

      </div>

      <div className="flex flex-wrap items-center gap-2.5 border-t border-white/15 pt-3">
        <TableSearch
          id="dashboard-ticket-search"
          value={searchQuery}
          onChange={onSearchChange}
          placeholder={searchPlaceholder}
          aria-label={searchPlaceholder}
          className="max-w-[480px] min-w-52"
        />
      {children && (
        <div className="flex flex-wrap items-center gap-2.5">
          {children}
        </div>
      )}
      {onClick && <CallToAction icon="add" onClick={onClick} className="ml-auto shrink-0">New</CallToAction>}
      </div>
    </div>
  );
};
