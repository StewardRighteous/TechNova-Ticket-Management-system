import React from "react";

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
            <h2 className={`text-base font-bold tracking-tight ${navy ? "text-white" : "text-slate-900"}`}>
              {title}
            </h2>
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
        <div className="relative max-w-xs min-w-60">
          <span aria-hidden="true" className="material-symbols-outlined absolute top-1/2 left-2.5 -translate-y-1/2 text-[17px] text-slate-500">
            search
          </span>
          <input
            type="search"
            id="ticket-search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pr-3 pl-8 text-sm text-slate-900 transition-all outline-none placeholder:text-slate-500 focus:border-teal-600 focus:ring-2 focus:ring-teal-200"
          />
        </div>
      {children && (
        <div className="flex flex-wrap items-center gap-2.5">
          {children}
        </div>
      )}
      {onClick && <button
        type="button"
        onClick={onClick}
        className="ml-auto flex shrink-0 items-center gap-1 rounded-lg bg-teal-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-teal-700 focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        <span aria-hidden="true" className="material-symbols-outlined text-[16px]">add</span> New
      </button>}
      </div>
    </div>
  );
};
