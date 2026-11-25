import { Checkbox } from "../atoms/Checkbox";
import { Label } from "../atoms/Label";
import { Input } from "../atoms/Input";
import { Icon } from "../atoms/Icon";
import { Button } from "../atoms/Button";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";

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
  portal?: boolean;
  hideClear?: boolean;
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
  portal = false,
  hideClear = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const [panelPosition, setPanelPosition] = useState({ top: 0, left: 0, width: 208, maxHeight: 224, opensAbove: false });
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => { if (isOpen) { setActiveIndex(0); searchRef.current?.focus({ preventScroll: true }); } }, [isOpen]);

  const positionPanel = useCallback(() => {
    const bounds = buttonRef.current?.getBoundingClientRect();
    if (!bounds) return;
    const spaceBelow = window.innerHeight - bounds.bottom - 12;
    const spaceAbove = bounds.top - 12;
    const opensAbove = spaceBelow < 224 && spaceAbove > spaceBelow;
    const maxHeight = Math.max(120, Math.min(224, opensAbove ? spaceAbove : spaceBelow));
    const width = Math.max(208, bounds.width);
    const left = Math.min(bounds.left - 12, window.innerWidth - width - 8);
    setPanelPosition({ top: opensAbove ? bounds.top - 4 : bounds.bottom + 4, left: Math.max(8, left), width, maxHeight, opensAbove });
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node) &&
        !listboxRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!isOpen || !portal) return;
    positionPanel();
    window.addEventListener("resize", positionPanel);
    window.addEventListener("scroll", positionPanel, true);
    return () => {
      window.removeEventListener("resize", positionPanel);
      window.removeEventListener("scroll", positionPanel, true);
    };
  }, [isOpen, portal, positionPanel]);

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

  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") { event.preventDefault(); setIsOpen(false); containerRef.current?.querySelector<HTMLButtonElement>("button")?.focus(); }
    else if (event.key === "ArrowDown" && filteredOptions.length) { event.preventDefault(); setActiveIndex((index) => (index + 1) % filteredOptions.length); }
    else if (event.key === "ArrowUp" && filteredOptions.length) { event.preventDefault(); setActiveIndex((index) => (index - 1 + filteredOptions.length) % filteredOptions.length); }
    else if (event.key === "Enter" && filteredOptions[activeIndex]) { event.preventDefault(); toggleOption(filteredOptions[activeIndex].value); }
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
        <Button tone="plain"
          ref={buttonRef}
          type="button"
          onClick={() => {
            if (portal) {
              positionPanel();
              setPortalTarget(containerRef.current?.closest("dialog") ?? document.body);
            }
            setIsOpen(!isOpen);
          }}
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
          <Icon className="text-[16px] text-slate-400">
            {isOpen ? "expand_less" : "expand_more"}
          </Icon>
        </Button>

        {selectedValues.length > 0 && (
          <Button tone="plain"
            type="button"
            onClick={clearAll}
            aria-label={`Clear ${label} filters`}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-400 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-700 transition-colors"
            title="Clear filters"
          >
            <Icon className="text-[15px]">close</Icon>
          </Button>
        )}
      </div>

      {/* Removable filter badges under or beside filter */}
      {showBadges && !hideClear && selectedValues.length > 0 && (
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
                <Button tone="plain"
                  type="button"
                  onClick={(e) => removeBadge(val, e)}
                  aria-label={`Remove ${displayLabel} filter`}
                  className="text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <Icon className="text-[13px] leading-none">close</Icon>
                </Button>
              </span>
            );
          })}
        </div>
      )}

      {/* Dropdown panel */}
      {isOpen && (
        (() => {
          const panel = <div
          ref={listboxRef}
          role="listbox"
          style={portal ? { position: "fixed", top: panelPosition.opensAbove ? undefined : panelPosition.top, bottom: panelPosition.opensAbove ? window.innerHeight - panelPosition.top : undefined, left: panelPosition.left, width: panelPosition.width, maxHeight: panelPosition.maxHeight } : undefined}
          className={`${portal ? "z-[120]" : "absolute top-10 right-0 z-50 min-w-52"} rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg animate-in fade-in slide-in-from-top-1 duration-150`}
        >
          {/* Search filter input */}
          <div className="relative mb-1 px-1">
            <Input appearance="plain"
              ref={searchRef}
              type="text"
              aria-label={`Search ${label} options`}
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setActiveIndex(0); }}
              onKeyDown={handleSearchKeyDown}
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
              filteredOptions.map((opt, index) => {
                const isSelected = selectedValues.includes(opt.value);
                return (
                  <Label variant="plain"
                    key={opt.value}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={`flex cursor-pointer items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 hover:bg-teal-100 hover:text-teal-900 focus-within:bg-teal-100 select-none ${index === activeIndex ? "bg-teal-100 text-teal-900" : ""}`}
                  >
                    <div className="flex items-center gap-2">
                      <Checkbox

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
                  </Label>
                );
              })
            )}
          </div>
        </div>;
          return portal ? (portalTarget ? createPortal(panel, portalTarget) : null) : panel;
        })()
      )}
    </div>
  );
};
