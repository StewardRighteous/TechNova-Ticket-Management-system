import React from 'react';

interface TableHeaderSectionProps {
  title: string;
  subtitle: string;
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
  searchPlaceholder = 'Search records...',
  children
}) => {
  return (
    <div className="bg-white rounded-t-2xl border border-b-0 border-slate-200 p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
      {/* Left: Table title + search bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 tracking-tight">{title}</h2>
            {badgeText && (
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                {badgeText}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>

        {/* Embedded Left Search Input */}
        <div className="relative min-w-[240px] max-w-xs">
          <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-[17px]">
            search
          </span>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 text-slate-800 placeholder:text-slate-400 text-xs rounded-lg border border-slate-200 outline-none focus:bg-white focus:ring-1 focus:ring-indigo-500 transition-all"
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
