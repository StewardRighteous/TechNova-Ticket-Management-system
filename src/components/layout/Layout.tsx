import React from "react";
import { useTicketStore } from "../../store";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";

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
          isSidebarCollapsed ? "pl-17" : "pl-64"
        }`}
      >
        <Header />
        <main className="min-h-screen pt-16">{children}</main>
      </div>
    </div>
  );
};
