import { Icon } from "../atoms/Icon";
import { Button } from "../atoms/Button";
import { Input } from "../atoms/Input";
import { FieldHint } from "../molecules/FieldHint";
import React, { useEffect, useId, useRef, useState } from "react";
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
  showLabel?: boolean;
  density?: "standard" | "compact";
  info?: string;
}

export const SelectDropdown: React.FC<SelectDropdownProps> = ({
  label,
  value,
  options,
  onChange,
  placeholder = "Select an option",
  required = false,
  disabled = false,
  className = "",
  showLabel = false,
  density = "standard",
  info,
}) => {
  const compact = density === "compact";
  const [isOpen, setIsOpen] = useState(false);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const [query, setQuery] = useState("");
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0, maxHeight: 320, opensAbove: false });
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);
  const listboxId = useId();
  const selectedOption = options.find((option) => option.value === value);
  const isSearchable = options.length > 3;
  const filteredOptions = isSearchable
    ? options.filter((option) => option.label.toLowerCase().includes(query.trim().toLowerCase()))
    : options;

  const updatePosition = () => {
    const button = buttonRef.current;
    if (!button) return;
    const bounds = button.getBoundingClientRect();
    const spaceBelow = window.innerHeight - bounds.bottom - 12;
    const spaceAbove = bounds.top - 12;
    const opensAbove = spaceBelow < 220 && spaceAbove > spaceBelow;
    const maxHeight = Math.max(120, Math.min(320, opensAbove ? spaceAbove : spaceBelow));
    setPosition({
      top: opensAbove ? bounds.top - 4 : bounds.bottom + 4,
      left: bounds.left,
      width: bounds.width,
      maxHeight,
      opensAbove,
    });
  };

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (!containerRef.current?.contains(target) && !listboxRef.current?.contains(target))
        setIsOpen(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    updatePosition();
    if (!isSearchable) {
      const options = listboxRef.current?.querySelectorAll<HTMLButtonElement>('[role="option"]');
      const selected = Array.from(options ?? []).find(
        (option) => option.getAttribute("aria-selected") === "true",
      );
      (selected ?? options?.[0])?.focus();
    }
    const reposition = () => updatePosition();
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);
    return () => {
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
    };
  }, [isOpen, isSearchable]);

  const closeAndFocus = () => {
    setIsOpen(false);
    buttonRef.current?.focus();
  };

  return (
    <div
      ref={containerRef}
      className={`relative min-w-0 ${className}`}
      onKeyDown={(event) => {
        if (!isOpen) return;
        if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          closeAndFocus();
        } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
          const options = Array.from(
            listboxRef.current?.querySelectorAll<HTMLButtonElement>('[role="option"]') ?? [],
          );
          if (!options.length) return;
          event.preventDefault();
          const current = options.findIndex((option) => option === event.target);
          const next =
            event.key === "ArrowDown" ? current + 1 : current < 0 ? options.length - 1 : current - 1;
          options[(next + options.length) % options.length]?.focus();
        }
      }}
    >
      {showLabel && (
        <div className={`mb-1 flex items-center gap-1 font-semibold ${compact ? "text-xs text-slate-600" : "text-sm text-slate-700"}`}>
          {label}
          {required && (
            <span className="text-red-600" aria-hidden="true">
              *
            </span>
          )}
          {info && <FieldHint label={label}>{info}</FieldHint>}
        </div>
      )}
      <Input
        appearance="plain"
        type="hidden"
        value={value}
        required={required}
        disabled={disabled}
        aria-label={label}
      />
      <Button
        tone="plain"
        ref={buttonRef}
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-controls={isOpen ? listboxId : undefined}
        aria-label={label}
        onClick={(event) => {
          setPortalTarget(event.currentTarget.closest("dialog") ?? document.body);
          setQuery("");
          setIsOpen((open) => !open);
        }}
        className={`flex w-full items-center justify-between rounded-md border border-slate-300 bg-white px-3 text-left text-slate-900 transition hover:border-teal-500 focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400 ${compact ? "min-h-9 py-1.5 text-xs" : "min-h-10 py-2 text-sm"}`}
      >
        <span className={selectedOption ? "truncate" : "truncate text-slate-400"}>
          {selectedOption?.label || placeholder}
        </span>
        <Icon
          aria-hidden="true"
          className={`ml-2 shrink-0 text-slate-500 transition-transform ${compact ? "text-[16px]" : "text-[20px]"} ${isOpen ? "rotate-180" : ""}`}
        >
          expand_more
        </Icon>
      </Button>
      {isOpen &&
        portalTarget &&
        createPortal(
          <div
            ref={listboxRef}
            className="fixed z-[100] overflow-hidden rounded-lg border border-slate-200 bg-white p-1.5 shadow-xl"
            style={{
              top: position.opensAbove ? undefined : position.top,
              bottom: position.opensAbove ? window.innerHeight - position.top : undefined,
              left: position.left,
              width: position.width,
              maxHeight: position.maxHeight,
            }}
          >
            {isSearchable && (
              <Input
                appearance="plain"
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={`Search ${label.toLowerCase()}...`}
                aria-label={`Search ${label.toLowerCase()}`}
                className="mb-1.5 w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-sm text-slate-900 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
              />
            )}
            <div
              id={listboxId}
              role="listbox"
              aria-label={label}
              className="overflow-y-auto"
              style={{ maxHeight: Math.max(80, position.maxHeight - (isSearchable ? 58 : 12)) }}
            >
              {filteredOptions.length ? (
                filteredOptions.map((option) => {
                  const selected = option.value === value;
                  return (
                    <Button
                      tone="plain"
                      key={option.value}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onClick={() => {
                        onChange(option.value);
                        closeAndFocus();
                      }}
                      className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-sm transition-colors outline-none focus:bg-teal-100 focus:text-teal-900 ${selected ? "bg-teal-50 font-semibold text-teal-800 hover:bg-teal-100" : "text-slate-700 hover:bg-teal-100 hover:text-teal-900"}`}
                    >
                      <span>{option.label}</span>
                      {selected && (
                        <Icon aria-hidden="true" className="text-[18px] text-teal-700">
                          check
                        </Icon>
                      )}
                    </Button>
                  );
                })
              ) : (
                <p className="px-3 py-2 text-sm text-slate-500">No matching options</p>
              )}
            </div>
          </div>,
          portalTarget,
        )}
    </div>
  );
};
