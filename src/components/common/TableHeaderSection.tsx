import React from "react";

interface TableHeaderSectionProps {
  title: string;
  subtitle?: string;
  badgeText?: string;
  searchQuery: string;
  onSearchChange: (val: string) => void;
  searchPlaceholder?: string;
  children?: React.ReactNode; // segmented controls/filters on the right
}

export const TableHeaderSection: React.FC<TableHeaderSectionProps> = ({
  title,
  subtitle,
  badgeText,
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Search records...",
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
            <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>
          )}
        </div>

        {/* Embedded Left Search Input */}
        <div className="relative max-w-xs min-w-60">
          <span className="material-symbols-outlined absolute top-1/2 left-2.5 -translate-y-1/2 text-[17px] text-slate-400">
            search
          </span>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pr-3 pl-8 text-xs text-slate-800 transition-all outline-none placeholder:text-slate-400 focus:bg-white focus:ring-1 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Right: Segmented controls & action buttons */}
      {children && (
        <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-auto">
          {children}
        </div>
      )}
    </div>
  );
};
