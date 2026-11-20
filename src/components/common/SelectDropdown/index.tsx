import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export interface SelectDropdownOption {
  value: string;
  label: string;
}

interface SelectDropdownProps {
  label: string;
  value: string;
  options: SelectDropdownOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

export const SelectDropdown: React.FC<SelectDropdownProps> = ({
  label, value, options, onChange, placeholder = "Select an option", required = false, disabled = false, className = "",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0, maxHeight: 320 });
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);
  const selectedOption = options.find((option) => option.value === value);
  const isSearchable = options.length > 4;
  const filteredOptions = isSearchable ? options.filter((option) => option.label.toLowerCase().includes(query.trim().toLowerCase())) : options;

  const updatePosition = () => {
    const button = buttonRef.current;
    if (!button) return;
    const bounds = button.getBoundingClientRect();
    const spaceBelow = window.innerHeight - bounds.bottom - 12;
    const spaceAbove = bounds.top - 12;
    const opensAbove = spaceBelow < 220 && spaceAbove > spaceBelow;
    const maxHeight = Math.max(120, Math.min(320, opensAbove ? spaceAbove : spaceBelow));
    setPosition({ top: opensAbove ? Math.max(12, bounds.top - maxHeight - 4) : bounds.bottom + 4, left: bounds.left, width: bounds.width, maxHeight });
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!containerRef.current?.contains(target) && !listboxRef.current?.contains(target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    updatePosition();
    const reposition = () => updatePosition();
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);
    return () => {
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
    };
  }, [isOpen]);

  return <div ref={containerRef} className={`relative ${className}`}>
    <input type="hidden" value={value} required={required} disabled={disabled} aria-label={label} />
    <button ref={buttonRef} type="button" disabled={disabled} aria-haspopup="listbox" aria-expanded={isOpen} aria-label={label} onClick={() => { setQuery(""); setIsOpen((open) => !open); }} onKeyDown={(event) => { if (event.key === "Escape") setIsOpen(false); }} className="flex min-h-10 w-full items-center justify-between rounded-md border border-slate-300 bg-white px-3 py-2 text-left text-sm text-[#1f2041] shadow-sm transition hover:border-teal-500 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400">
      <span className={selectedOption ? "truncate" : "truncate text-slate-400"}>{selectedOption?.label || placeholder}</span>
      <span aria-hidden="true" className={`material-symbols-outlined ml-2 shrink-0 text-[20px] text-slate-500 transition-transform ${isOpen ? "rotate-180" : ""}`}>expand_more</span>
    </button>
    {isOpen && createPortal(<div ref={listboxRef} role="listbox" aria-label={label} className="fixed z-[100] overflow-hidden rounded-lg border border-slate-200 bg-white p-1.5 shadow-xl" style={{ top: position.top, left: position.left, width: position.width, maxHeight: position.maxHeight }}>
      {isSearchable && <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${label.toLowerCase()}...`} aria-label={`Search ${label.toLowerCase()}`} className="mb-1.5 w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20" />}
      <div className="overflow-y-auto" style={{ maxHeight: Math.max(80, position.maxHeight - (isSearchable ? 58 : 12)) }}>
        {filteredOptions.length ? filteredOptions.map((option) => {
          const selected = option.value === value;
          return <button key={option.value} type="button" role="option" aria-selected={selected} onClick={() => { onChange(option.value); setIsOpen(false); setQuery(""); }} className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors ${selected ? "bg-teal-50 font-semibold text-teal-800" : "text-slate-700 hover:bg-slate-50"}`}><span>{option.label}</span>{selected && <span aria-hidden="true" className="material-symbols-outlined text-[18px] text-teal-700">check</span>}</button>;
        }) : <p className="px-3 py-2 text-sm text-slate-500">No matching options</p>}
      </div>
    </div>, document.body)}
  </div>;
};
