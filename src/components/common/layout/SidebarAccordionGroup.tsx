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
          className="w-full flex items-center justify-between px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider hover:text-slate-700 transition-colors"
        >
          <span>{title}</span>
          <span className="material-symbols-outlined text-[16px]">
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
