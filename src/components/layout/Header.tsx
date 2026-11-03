import React, { useState } from 'react';
import { useTicketStore } from '../../store';

export const Header: React.FC = () => {
  const {
    activeRole,
    currentUser,
    data,
    searchQuery,
    setSearchQuery,
    setIsCreateModalOpen,
    isSidebarCollapsed,
    loginAsEmployee,
    logout
  } = useTicketStore();

  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const currentRoleInfo = data.roles.find((r) => r.id === activeRole) || data.roles[0];
  const activeEmployee = currentUser || data.employees[0];

  return (
    <header
      className={`fixed top-0 right-0 h-16 bg-white/95 backdrop-blur border-b border-slate-200 z-40 flex items-center justify-between px-6 transition-all duration-300 ${
        isSidebarCollapsed ? 'left-20' : 'left-64'
      }`}
    >
      <div className="flex items-center gap-4 flex-1 max-w-lg">
        <div className="relative w-full">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[18px]">
            search
          </span>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search tickets, clients, or services..."
            className="w-full pl-9 pr-4 py-2 bg-slate-100 text-slate-800 placeholder:text-slate-400 text-xs rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-all border border-transparent focus:border-indigo-500"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="h-9 px-3.5 bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
          type="button"
        >
          <span className="material-symbols-outlined text-[17px]">add</span>
          <span>New Ticket</span>
        </button>

        <div className="h-6 w-px bg-slate-200"></div>

        <div className="relative">
          <button
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left"
            title="User Profile & Role Switcher"
          >
            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              <span className="material-symbols-outlined text-[17px]">{activeEmployee.avatar}</span>
            </div>
            <div className="hidden md:flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-slate-800 leading-none">{activeEmployee.name}</span>
                <span className="text-[10px] bg-indigo-100 text-indigo-800 font-semibold px-1.5 py-0.2 rounded">
                  Online
                </span>
              </div>
              <span className="text-[11px] text-indigo-600 font-medium">{currentRoleInfo.name}</span>
            </div>
            <span className="material-symbols-outlined text-[16px] text-slate-400">expand_more</span>
          </button>

          {isProfileDropdownOpen && (
            <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-900 block">{activeEmployee.name}</span>
                <span className="text-[11px] text-slate-500 font-mono block">{activeEmployee.email}</span>
              </div>

              <div className="px-3 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">
                Switch Operational Persona
              </div>
              {data.employees.map((emp) => {
                const isSelected = emp.id === activeEmployee.id;
                return (
                  <button
                    key={emp.id}
                    onClick={() => {
                      loginAsEmployee(emp.id);
                      setIsProfileDropdownOpen(false);
                    }}
                    className={`w-full px-3 py-1.5 text-left flex items-center justify-between hover:bg-slate-50 transition-colors ${
                      isSelected ? 'bg-indigo-50 font-bold text-indigo-700' : 'text-slate-700'
                    }`}
                  >
                    <span className="text-xs">{emp.name}</span>
                    <span className="text-[10px] text-slate-400">{emp.roleTitle.split('&')[0]}</span>
                  </button>
                );
              })}

              <div className="mt-2 pt-2 border-t border-slate-100 px-2">
                <button
                  onClick={() => {
                    setIsProfileDropdownOpen(false);
                    logout();
                  }}
                  className="w-full px-3 py-1.5 rounded-lg text-left text-xs font-bold text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-[16px]">logout</span>
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
