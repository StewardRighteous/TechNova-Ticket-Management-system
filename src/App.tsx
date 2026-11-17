import React from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
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
import { ROLE_PERMISSIONS } from "./utils/barrel";

const tabByPath: Record<string, string> = {
  "/dashboard": "dashboard", "/tickets": "tickets", "/companies": "companies",
  "/employees": "employees", "/services": "services", "/settings": "settings",
};

const RouteContent: React.FC = () => {
  const { isAuthenticated, activeRole, setActiveTab } = useTicketStore();
  const location = useLocation();
  const path = location.pathname;
  const section = `/${path.split("/")[1] || "dashboard"}`;
  const tab = tabByPath[section] || "dashboard";
  React.useEffect(() => setActiveTab(tab), [setActiveTab, tab]);

  if (!isAuthenticated) return <LoginPage />;
  if (!ROLE_PERMISSIONS[activeRole].allowedTabs.includes(tab)) return <Navigate to="/dashboard" replace />;

  return <Layout>
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<DashboardView />} />
      <Route path="/tickets" element={<TicketRegistryView />} />
      <Route path="/tickets/:ticketId" element={<TicketRegistryView />} />
      <Route path="/companies" element={<CompaniesView />} />
      <Route path="/companies/:companyId" element={<CompaniesView />} />
      <Route path="/employees" element={<EmployeesView />} />
      <Route path="/employees/:employeeId" element={<EmployeesView />} />
      <Route path="/services" element={<ServicesView />} />
      <Route path="/services/:serviceId" element={<ServicesView />} />
      <Route path="/settings" element={<SettingsView />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
    <CreateTicketModal />
    <ToastNotificationContainer />
  </Layout>;
};

export const App: React.FC = () => <RouteContent />;
export default App;
