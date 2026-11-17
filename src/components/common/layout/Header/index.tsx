import React, { useState } from "react";
import { useTicketStore } from "../../../../store/barrel";


export const Header: React.FC = () => {
  const {
    activeRole,
    activeTab,
    currentUser,
    data,
    setIsCreateModalOpen,
    isSidebarCollapsed,
    resetDemoData,
    addToast,
    logout,
  } = useTicketStore();

  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const currentRoleInfo =
    data.roles.find((r) => r.id === activeRole) || data.roles[0];
  const activeEmployee = currentUser || data.employees[0];

  const handleResetDemoData = () => {
    resetDemoData();
    addToast("Demo data successfully restored to seed state.", "success");
    setIsProfileDropdownOpen(false);
  };

  return (
    <header
      className={`fixed top-0 right-0 z-40 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-6 backdrop-blur transition-all duration-300 ${
        isSidebarCollapsed ? "left-15" : "left-64"
      }`}
    >
      <h1 className="text-xl font-extrabold tracking-tight capitalize sm:text-2xl">
        {activeTab}
      </h1>
      <div className="flex items-center gap-4">
    

        {/* Reset Demo Data Action */}
        <button
          onClick={handleResetDemoData}
          className="flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900"
          title="Reset Demo Data"
          type="button"
        >
          <span className="material-symbols-outlined text-[16px] text-slate-500">
            restart_alt
          </span>
          <span className="hidden sm:inline">Reset Demo</span>
        </button>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex h-9 items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-slate-800"
          type="button"
        >
          <span className="material-symbols-outlined text-[17px]">add</span>
          <span>New Ticket</span>
        </button>

        <div className="h-6 w-px bg-slate-200"></div>

        {activeTab !== "dashboard" && (
          <div className="relative">
            <button
              onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
              className="relative flex size-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800"
              title="Notifications"
              type="button"
            >
              <span className="material-symbols-outlined">notifications</span>
              {data.notifications.some(
                (notification) => !notification.read,
              ) && (
                <span className="absolute top-1 right-1 size-2 rounded-full bg-indigo-500 ring-2 ring-white" />
              )}
            </button>
            {isNotificationsOpen && (
              <div className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-slate-100 bg-white py-2 shadow-xl">
                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2">
                  <span className="text-sm font-bold text-slate-900">
                    Notifications
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {data.notifications.length} recent
                  </span>
                </div>
                {data.notifications.slice(0, 5).map((notification) => (
                  <div
                    key={notification.id}
                    className="flex gap-3 px-4 py-3 hover:bg-slate-50"
                  >
                    <span className="material-symbols-outlined text-[18px] text-indigo-500">
                      {notification.icon}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800">
                        {notification.title}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">
                        {notification.message}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="relative">
          <button
            onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
            className="flex items-center gap-2.5 rounded-lg border border-slate-200 px-3 py-1.5 text-left transition-all hover:border-slate-300 hover:bg-slate-50"
            title="User Profile & Role Switcher"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white shadow-sm">
              <span className="material-symbols-outlined text-[17px]">
                {activeEmployee.avatar}
              </span>
            </div>
            <div className="hidden flex-col md:flex">
              <div className="flex items-center gap-1.5">
                <span className="text-xs leading-none font-bold text-slate-800">
                  {activeEmployee.name}
                </span>
                <span className="py-0.2 rounded bg-indigo-100 px-1.5 text-[10px] font-semibold text-indigo-800">
                  Online
                </span>
              </div>
              <span className="text-[11px] font-medium text-indigo-600">
                {currentRoleInfo.name}
              </span>
            </div>
            <span className="material-symbols-outlined text-[16px] text-slate-400">
              expand_more
            </span>
          </button>

          {isProfileDropdownOpen && (
            <div className="animate-in fade-in slide-in-from-top-2 absolute right-0 z-50 mt-2 w-72 rounded-xl border border-slate-100 bg-white py-2 shadow-xl duration-150">
              <div className="border-b border-slate-100 px-3 py-2">
                <span className="block text-xs font-bold text-slate-900">
                  {activeEmployee.name}
                </span>
                <span className="block font-mono text-[11px] text-slate-500">
                  {activeEmployee.email}
                </span>
              </div>

              <div className="border-slate-100 px-2 pt-2">
                <button
                  onClick={() => {
                    setIsProfileDropdownOpen(false);
                    logout();
                  }}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-1.5 text-left text-xs font-bold text-red-600 transition-colors hover:bg-red-50"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    logout
                  </span>
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
