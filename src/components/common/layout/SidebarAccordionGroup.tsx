import React from 'react';

interface SidebarAccordionGroupProps {
  title: string;
  isOpen: boolean;
  onToggle: () => void;
  isCollapsed: boolean;
  children: React.ReactNode;
}

export const SidebarAccordionGroup: React.FC<SidebarAccordionGroupProps> = ({
  title,
  isOpen,
  onToggle,
  isCollapsed,
  children
}) => {
  return (
    <div className="space-y-1">
      {!isCollapsed ? (
        <button
          onClick={onToggle}
          className="flex w-full items-center justify-between px-3 py-1.5 text-xs font-bold tracking-wider text-slate-300 uppercase transition-colors hover:text-white focus-visible:ring-2 focus-visible:ring-indigo-300 focus-visible:outline-none"
        >
          <span>{title}</span>
          <span aria-hidden="true" className="material-symbols-outlined text-[16px]">
            {isOpen ? 'expand_less' : 'expand_more'}
          </span>
        </button>
      ) : (
        <div className="h-px bg-slate-200 my-2" />
      )}
      {(isOpen || isCollapsed) && <div className="space-y-1">{children}</div>}
    </div>
  );
};
