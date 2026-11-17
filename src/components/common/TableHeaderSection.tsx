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
}) => {
  return (
    <div className="flex flex-col justify-between gap-4 rounded-t-2xl border border-b-0 border-slate-200 bg-white p-5 lg:flex-row lg:items-center">
      {/* Left: Table title + search bar */}
      <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold tracking-tight text-slate-900">
              {title}
            </h2>
            {badgeText && (
              <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
                {badgeText}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="mt-1 text-sm leading-5 text-slate-600">{subtitle}</p>
          )}
        </div>

        {/* Embedded Left Search Input */}
        <div className="relative max-w-xs min-w-60">
          <span aria-hidden="true" className="material-symbols-outlined absolute top-1/2 left-2.5 -translate-y-1/2 text-[17px] text-slate-500">
            search
          </span>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            aria-label={searchPlaceholder}
            className="w-full rounded-lg border border-slate-300 bg-slate-50 py-2 pr-3 pl-8 text-sm text-slate-900 transition-all outline-none placeholder:text-slate-500 focus:border-indigo-600 focus:bg-white focus:ring-2 focus:ring-indigo-200"
          />
        </div>
      </div>

      {/* Right: Segmented controls & action buttons */}
      {children && (
        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
          {children}
        </div>
      )}

      {onClick && <button
        type="button"
        onClick={onClick}
        className="flex items-center gap-1 rounded-lg bg-indigo-600 px-3.5 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 focus-visible:outline-none"
      >
        <span aria-hidden="true" className="material-symbols-outlined text-[16px]">add</span> New
      </button>}
    </div>
  );
};
