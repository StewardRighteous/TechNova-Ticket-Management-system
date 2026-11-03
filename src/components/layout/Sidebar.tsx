import React from 'react';
import { useTicketStore } from '../../store';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, data } = useTicketStore();
  const ticketCount = data.tickets.length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'grid_view' },
    { id: 'tickets', label: 'Tickets', icon: 'confirmation_number', badge: ticketCount },
    { id: 'companies', label: 'Companies', icon: 'domain', badge: data.companies.length },
    { id: 'employees', label: 'Employees', icon: 'badge', badge: data.employees.length },
    { id: 'services', label: 'Services', icon: 'layers', badge: data.services.length }
  ];

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 bg-white border-r border-slate-200 z-50 flex flex-col justify-between select-none">
      <div className="flex flex-col">
        {/* Brand header */}
        <div className="h-16 px-6 flex items-center gap-3 border-b border-slate-100">
          <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-white shadow-sm">
            <span className="material-symbols-outlined text-[19px]">confirmation_number</span>
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-[15px] tracking-tight leading-tight text-slate-900">TechNova</span>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Solutions Pvt. Ltd</span>
          </div>
        </div>

        {/* Workspace navigation */}
        <div className="px-4 py-3">
          <div className="px-3 py-1 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Workspace
          </div>
        </div>

        <nav className="px-3 flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700 font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`material-symbols-outlined text-[20px] ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>
                    {item.icon}
                  </span>
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className={`px-2 py-0.5 text-xs rounded-full font-mono ${isActive ? 'bg-indigo-200/60 text-indigo-800' : 'bg-slate-100 text-slate-500'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* System info & bottom links */}
      <div className="flex flex-col gap-2 px-3 pb-5">
        <div className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          System
        </div>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'settings'
              ? 'bg-indigo-50 text-indigo-700 font-semibold'
              : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
          }`}
        >
          <span className="material-symbols-outlined text-[20px] text-slate-400">settings</span>
          <span>System Settings</span>
        </button>

        <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 mt-2">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-slate-700">Dispatcher Status</span>
            <span className="inline-flex items-center gap-1 text-emerald-600 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Live
            </span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">Build: v4.19-prod</div>
        </div>
      </div>
    </aside>
  );
};
