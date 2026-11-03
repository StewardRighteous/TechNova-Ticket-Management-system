import React, { useState } from 'react';
import { useTicketStore } from '../../store';
import type { RoleId } from '../../types';

export const Header: React.FC = () => {
  const {
    activeRole,
    setActiveRole,
    data,
    searchQuery,
    setSearchQuery,
    setIsCreateModalOpen
  } = useTicketStore();

  const [isRoleDropdownOpen, setIsRoleDropdownOpen] = useState(false);
  const currentRoleInfo = data.roles.find((r) => r.id === activeRole) || data.roles[0];
  const activeEmployee = data.employees.find((e) => e.role === activeRole) || data.employees[0];

  return (
    <header className="fixed top-0 left-64 right-0 h-16 bg-white/95 backdrop-blur border-b border-slate-200 z-40 flex items-center justify-between px-8">
      {/* Search Input */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
            search
          </span>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tickets, companies, employees... (Press '/' to focus)"
            className="w-full pl-9 pr-4 py-2 bg-slate-100 text-slate-800 placeholder:text-slate-400 text-xs rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all border border-transparent focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-4">
        {/* Create Ticket CTA */}
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="h-9 px-4 bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold rounded-lg flex items-center gap-2 transition-colors shadow-sm"
          type="button"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          <span>New Ticket</span>
        </button>

        <div className="h-6 w-px bg-slate-200"></div>

        {/* Dynamic Role Switcher dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsRoleDropdownOpen(!isRoleDropdownOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left"
            title="Switch Operational Role Perspective"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              <span className="material-symbols-outlined text-[17px]">badge</span>
            </div>
            <div className="hidden md:flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-800 leading-none">{activeEmployee.name}</span>
                <span className="text-[10px] bg-indigo-100 text-indigo-800 font-semibold px-1.5 py-0.2 rounded">
                  Active
                </span>
              </div>
              <span className="text-[11px] text-indigo-600 font-medium">{currentRoleInfo.name}</span>
            </div>
            <span className="material-symbols-outlined text-[16px] text-slate-400">expand_more</span>
          </button>

          {isRoleDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 mb-1">
                Switch Operational Role
              </div>
              {data.roles.map((r) => {
                const isSelected = r.id === activeRole;
                return (
                  <button
                    key={r.id}
                    onClick={() => {
                      setActiveRole(r.id as RoleId);
                      setIsRoleDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-2 text-left flex flex-col gap-0.5 hover:bg-slate-50 transition-colors ${
                      isSelected ? 'bg-indigo-50/70 border-l-4 border-indigo-600' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold ${isSelected ? 'text-indigo-900' : 'text-slate-800'}`}>
                        {r.name}
                      </span>
                      {isSelected && (
                        <span className="material-symbols-outlined text-[16px] text-indigo-600">check</span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 line-clamp-1">{r.description}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
