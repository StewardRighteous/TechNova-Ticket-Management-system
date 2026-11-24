import React from "react";

interface TableSearchProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  "aria-label": string;
  className?: string;
  compact?: boolean;
}

/** Consistent search treatment for table toolbars. */
export const TableSearch: React.FC<TableSearchProps> = ({
  id,
  value,
  onChange,
  placeholder,
  "aria-label": ariaLabel,
  className = "",
  compact = false,
}) => (
  <form
    role="search"
    className={`flex ${compact ? "h-8" : "h-[42px]"} w-full min-w-0 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition focus-within:border-slate-300 focus-within:ring-2 focus-within:ring-slate-100 ${className}`}
    onSubmit={(event) => event.preventDefault()}
  >
    <div className="relative min-w-0 flex-1">
      <span
        aria-hidden="true"
        className={`material-symbols-outlined absolute top-1/2 -translate-y-1/2 text-slate-400 ${compact ? "left-2 text-base" : "left-3.5 text-[19px]"}`}
      >
        search
      </span>
      <input
        type="search"
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        className={`h-full w-full border-0 bg-transparent pr-3 text-slate-800 outline-none placeholder:text-slate-500 ${compact ? "py-1 pl-8 text-xs" : "py-1.5 pl-10 text-sm"}`}
      />
    </div>
    <button
      type="submit"
      className={`shrink-0 bg-[#102345] font-bold text-white transition-colors hover:bg-[#17325f] focus-visible:outline-2 focus-visible:outline-offset-[-3px] focus-visible:outline-white ${compact ? "px-3 text-xs" : "px-4 text-sm"}`}
    >
      Search
    </button>
  </form>
);
