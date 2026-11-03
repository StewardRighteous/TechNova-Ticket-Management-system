import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#f8f9ff] text-slate-900">
      <Sidebar />
      <div className="pl-64">
        <Header />
        <main className="pt-16 min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
};
