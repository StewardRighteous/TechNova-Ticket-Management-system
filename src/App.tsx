import React from "react";
import { useTicketStore } from "./store/barrel";
import { Layout } from "./components/common/layout/barrel";
import { LoginPage } from "./components/auth/barrel";
import { DashboardView } from "./components/dashboard/barrel";
import { TicketRegistryView } from "./components/tickets/barrel";
import { CompaniesView } from "./components/companies/barrel";
import { EmployeesView } from "./components/employees/barrel";
import { ServicesView } from "./components/services/barrel";
import { SettingsView } from "./components/settings/barrel";
import { CreateTicketModal } from "./components/common/modals/barrel";
import { ToastNotificationContainer } from "./components/common/barrel";

export const App: React.FC = () => {
  const { activeTab, isAuthenticated } = useTicketStore();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardView />;
      case "tickets":
        return <TicketRegistryView />;
      case "companies":
        return <CompaniesView />;
      case "employees":
        return <EmployeesView />;
      case "services":
        return <ServicesView />;
      case "settings":
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <Layout>
      {renderActiveView()}
      <CreateTicketModal />
      <ToastNotificationContainer />
    </Layout>
  );
};

export default App;
