import React from 'react';
import { useTicketStore } from './store';
import { Layout } from './components/layout';
import { LoginPage } from './components/auth';
import { DashboardView } from './components/dashboard';
import { TicketRegistryView } from './components/tickets';
import { CompaniesView } from './components/companies';
import { EmployeesView } from './components/employees';
import { ServicesView } from './components/services';
import { SettingsView } from './components/settings';
import { CreateTicketModal } from './components/modals';

export const App: React.FC = () => {
  const { activeTab, isAuthenticated } = useTicketStore();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'tickets':
        return <TicketRegistryView />;
      case 'companies':
        return <CompaniesView />;
      case 'employees':
        return <EmployeesView />;
      case 'services':
        return <ServicesView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <Layout>
      {renderActiveView()}
      <CreateTicketModal />
    </Layout>
  );
};

export default App;
