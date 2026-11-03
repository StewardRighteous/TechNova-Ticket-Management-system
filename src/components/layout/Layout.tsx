import React from 'react';
import { useTicketStore } from '../../store';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isSidebarCollapsed } = useTicketStore();

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-slate-900">
      <Sidebar />
      <div
        className={`transition-all duration-300 ${
          isSidebarCollapsed ? 'pl-20' : 'pl-64'
        }`}
      >
        <Header />
        <main className="pt-16 min-h-screen">{children}</main>
      </div>
    </div>
  );
};
