import React from "react";
import { useTicketStore } from "../../../store/barrel";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { loadWorkspacePreferences } from "../../../utils/workspacePreferences";

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isSidebarCollapsed, currentUser } = useTicketStore();
  const [compactMode, setCompactMode] = React.useState(() => loadWorkspacePreferences(currentUser?.id).compactMode);
  React.useEffect(() => {
    setCompactMode(loadWorkspacePreferences(currentUser?.id).compactMode);
    const refreshPreferences = (event: Event) => {
      const preferenceEvent = event as CustomEvent<{ personaId?: string }>;
      if (preferenceEvent.detail?.personaId === currentUser?.id) {
        setCompactMode(loadWorkspacePreferences(currentUser?.id).compactMode);
      }
    };
    window.addEventListener("technova-preferences-updated", refreshPreferences);
    return () => window.removeEventListener("technova-preferences-updated", refreshPreferences);
  }, [currentUser?.id]);

  return (
    <div className={`min-h-screen bg-[#f8f9ff] text-slate-900${compactMode ? " compact-workspace" : ""}`}>
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
