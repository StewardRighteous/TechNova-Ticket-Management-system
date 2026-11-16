import React, { useState, useRef, useEffect } from "react";

export interface ComboboxOption {
  value: string;
  label: string;
  badge?: string;
}

export interface ComboboxFilterProps {
  label: string;
  options: ComboboxOption[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  singleSelect?: boolean;
  placeholder?: string;
  showBadges?: boolean;
  className?: string;
}

export const ComboboxFilter: React.FC<ComboboxFilterProps> = ({
  label,
  options,
  selectedValues,
  onChange,
  singleSelect = false,
  placeholder,
  showBadges = false,
  className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleOption = (val: string) => {
    if (singleSelect) {
      if (selectedValues.includes(val)) {
        onChange([]);
      } else {
        onChange([val]);
        setIsOpen(false);
      }
      return;
    }

    if (selectedValues.includes(val)) {
      onChange(selectedValues.filter((v) => v !== val));
    } else {
      onChange([...selectedValues, val]);
    }
  };

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  const removeBadge = (val: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selectedValues.filter((v) => v !== val));
  };

  return (
    <div className={`relative inline-flex flex-col gap-1.5 ${className}`} ref={containerRef}>
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          aria-label={`Filter by ${label}`}
          className={`flex h-8 items-center gap-2 rounded-lg border px-3 text-xs font-semibold transition-colors ${
            selectedValues.length > 0
              ? "border-slate-300 bg-slate-100 text-slate-900"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900"
          }`}
        >
          <span>{label}</span>
          {selectedValues.length > 0 && (
            <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-slate-900 px-1 text-[10px] font-bold text-white">
              {selectedValues.length}
            </span>
          )}
          <span className="material-symbols-outlined text-[16px] text-slate-400">
            {isOpen ? "expand_less" : "expand_more"}
          </span>
        </button>

        {selectedValues.length > 0 && (
          <button
            type="button"
            onClick={clearAll}
            aria-label={`Clear ${label} filters`}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 transition-colors"
            title="Clear filters"
          >
            <span className="material-symbols-outlined text-[15px]">close</span>
          </button>
        )}
      </div>

      {/* Removable filter badges under or beside filter */}
      {showBadges && selectedValues.length > 0 && (
        <div className="flex flex-wrap items-center gap-1">
          {selectedValues.map((val) => {
            const opt = options.find((o) => o.value === val);
            const displayLabel = opt ? opt.label : val;
            return (
              <span
                key={val}
                className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-700"
              >
                <span>{displayLabel}</span>
                <button
                  type="button"
                  onClick={(e) => removeBadge(val, e)}
                  aria-label={`Remove ${displayLabel} filter`}
                  className="text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <span className="material-symbols-outlined text-[13px] leading-none">close</span>
                </button>
              </span>
            );
          })}
        </div>
      )}

      {/* Dropdown panel */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute top-10 left-0 z-50 min-w-52 rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg animate-in fade-in slide-in-from-top-1 duration-150"
        >
          {/* Search filter input */}
          <div className="relative mb-1 px-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={placeholder || `Search ${label}...`}
              className="w-full rounded-lg border border-slate-200 bg-slate-50/50 px-2.5 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-400 focus:bg-white"
            />
          </div>

          {/* Options list */}
          <div className="max-h-56 overflow-y-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-center text-xs text-slate-400">
                No matching options
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = selectedValues.includes(opt.value);
                return (
                  <label
                    key={opt.value}
                    className="flex cursor-pointer items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 hover:bg-slate-50 hover:text-slate-900 select-none"
                  >
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        aria-label={opt.label}
                        checked={isSelected}
                        onChange={() => toggleOption(opt.value)}
                        className="rounded border-slate-300 text-slate-900 focus:ring-0"
                      />
                      <span className={isSelected ? "font-semibold text-slate-900" : ""}>
                        {opt.label}
                      </span>
                    </div>
                    {opt.badge && (
                      <span className="text-[10px] text-slate-400 font-mono">
                        {opt.badge}
                      </span>
                    )}
                  </label>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
