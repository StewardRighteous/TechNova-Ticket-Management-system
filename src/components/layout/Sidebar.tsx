import React, { useState } from 'react';
import { useTicketStore } from '../../store';
import { SidebarAccordionGroup } from './SidebarAccordionGroup';
import { ROLE_PERMISSIONS, filterTicketsByRole } from '../../utils';

export const Sidebar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    data,
    activeRole,
    currentUser,
    isSidebarCollapsed,
    toggleSidebarCollapse,
    logout
  } = useTicketStore();

  const [isOperationsOpen, setIsOperationsOpen] = useState(true);
  const [isClientsOpen, setIsClientsOpen] = useState(true);

  const permissions = ROLE_PERMISSIONS[activeRole];
  const roleTickets = filterTicketsByRole(data.tickets, activeRole, currentUser?.id);

  const isTabAllowed = (tab: string) => permissions.allowedTabs.includes(tab);

  return (
    <aside
      className={`fixed left-0 top-0 bottom-0 bg-white border-r border-slate-200 z-50 flex flex-col justify-between transition-all duration-300 select-none ${
        isSidebarCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      <div className="flex flex-col overflow-y-auto">
        <div className="h-16 px-4 flex items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-sm shrink-0">
              <span className="material-symbols-outlined text-[20px]">confirmation_number</span>
            </div>
            {!isSidebarCollapsed && (
              <div className="flex flex-col truncate">
                <span className="font-bold text-[15px] tracking-tight text-slate-900 truncate">TechNova</span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider truncate">Solutions Pvt. Ltd</span>
              </div>
            )}
          </div>
          <button
            onClick={toggleSidebarCollapse}
            title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">
              {isSidebarCollapsed ? 'chevron_right' : 'chevron_left'}
            </span>
          </button>
        </div>

        <div className="px-3 py-3 space-y-4">
          {/* Dashboard Tab */}
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span className="material-symbols-outlined text-[20px] shrink-0">grid_view</span>
            {!isSidebarCollapsed && <span>Dashboard</span>}
          </button>

          {/* Group 1: Incidents & Team */}
          {(isTabAllowed('tickets') || isTabAllowed('employees')) && (
            <SidebarAccordionGroup
              title="Incidents & Team"
              isOpen={isOperationsOpen}
              onToggle={() => setIsOperationsOpen(!isOperationsOpen)}
              isCollapsed={isSidebarCollapsed}
            >
              {isTabAllowed('tickets') && (
                <button
                  onClick={() => setActiveTab('tickets')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'tickets' ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="material-symbols-outlined text-[20px] shrink-0">confirmation_number</span>
                    {!isSidebarCollapsed && <span className="truncate">Tickets</span>}
                  </div>
                  {!isSidebarCollapsed && (
                    <span className="px-2 py-0.5 text-[11px] rounded-full font-mono bg-indigo-100 text-indigo-800">
                      {roleTickets.length}
                    </span>
                  )}
                </button>
              )}

              {isTabAllowed('employees') && (
                <button
                  onClick={() => setActiveTab('employees')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'employees' ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="material-symbols-outlined text-[20px] shrink-0">badge</span>
                    {!isSidebarCollapsed && <span className="truncate">Employees</span>}
                  </div>
                  {!isSidebarCollapsed && (
                    <span className="px-2 py-0.5 text-[11px] rounded-full font-mono bg-slate-100 text-slate-600">
                      {data.employees.length}
                    </span>
                  )}
                </button>
              )}
            </SidebarAccordionGroup>
          )}

          {/* Group 2: Accounts & Offerings */}
          {(isTabAllowed('companies') || isTabAllowed('services')) && (
            <SidebarAccordionGroup
              title="Accounts & Offerings"
              isOpen={isClientsOpen}
              onToggle={() => setIsClientsOpen(!isClientsOpen)}
              isCollapsed={isSidebarCollapsed}
            >
              {isTabAllowed('companies') && (
                <button
                  onClick={() => setActiveTab('companies')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'companies' ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="material-symbols-outlined text-[20px] shrink-0">domain</span>
                    {!isSidebarCollapsed && <span className="truncate">Companies</span>}
                  </div>
                  {!isSidebarCollapsed && (
                    <span className="px-2 py-0.5 text-[11px] rounded-full font-mono bg-slate-100 text-slate-600">
                      {data.companies.length}
                    </span>
                  )}
                </button>
              )}

              {isTabAllowed('services') && (
                <button
                  onClick={() => setActiveTab('services')}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'services' ? 'bg-indigo-50 text-indigo-700 font-bold border border-indigo-200' : 'text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <span className="material-symbols-outlined text-[20px] shrink-0">layers</span>
                    {!isSidebarCollapsed && <span className="truncate">Services</span>}
                  </div>
                  {!isSidebarCollapsed && (
                    <span className="px-2 py-0.5 text-[11px] rounded-full font-mono bg-slate-100 text-slate-600">
                      {data.services.length}
                    </span>
                  )}
                </button>
              )}
            </SidebarAccordionGroup>
          )}
        </div>
      </div>

      {/* Footer System Info & Sign Out */}
      <div className="p-3 border-t border-slate-100 space-y-2">
        {isTabAllowed('settings') && (
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
              activeTab === 'settings' ? 'bg-indigo-50 text-indigo-700 font-bold' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <span className="material-symbols-outlined text-[20px] shrink-0">settings</span>
            {!isSidebarCollapsed && <span>Settings</span>}
          </button>
        )}

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-red-600 hover:bg-red-50 transition-colors"
          title="Sign Out"
        >
          <span className="material-symbols-outlined text-[20px] shrink-0">logout</span>
          {!isSidebarCollapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
};
