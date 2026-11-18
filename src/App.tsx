import React from "react";
import { Link, Navigate, Route, Routes, useLocation, useNavigationType } from "react-router-dom";
import { useTicketStore } from "./store/barrel";
import { Layout } from "./components/common/layout/barrel";
import { LoginPage } from "./components/auth/barrel";
import { DashboardView } from "./components/dashboard/barrel";
import { TicketRegistryView } from "./components/tickets/barrel";
import { CreateTicketPage } from "./components/tickets/CreateTicketPage";
import { CompaniesView } from "./components/companies/barrel";
import { CreateCompanyPage } from "./components/companies/CreateCompanyPage";
import { EmployeesView } from "./components/employees/barrel";
import { CreateEmployeePage } from "./components/employees/CreateEmployeePage";
import { ServicesView } from "./components/services/barrel";
import { CreateServicePage } from "./components/services/CreateServicePage";
import { SettingsView } from "./components/settings/barrel";
import { NotificationsView } from "./components/notifications/NotificationsView";
import { ToastNotificationContainer } from "./components/common/barrel";
import { ROLE_PERMISSIONS } from "./utils/barrel";

const tabByPath: Record<string, string> = {
  "/dashboard": "dashboard", "/tickets": "tickets", "/companies": "companies",
  "/employees": "employees", "/services": "services", "/settings": "settings", "/notifications": "notifications",
};

const AccessDenied: React.FC<{ destination: string }> = ({ destination }) => (
  <Layout>
    <section role="status" className="m-6 rounded-xl border border-amber-200 bg-amber-50 p-6">
      <h1 className="text-lg font-semibold text-slate-900">This section isn’t available</h1>
      <p className="mt-2 text-sm text-slate-700">Your current role doesn’t have access to this page.</p>
      <Link to={destination} className="mt-4 inline-flex rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">Return to an available page</Link>
    </section>
  </Layout>
);

const RouteContent: React.FC = () => {
  const { isAuthenticated, activeRole, setActiveTab } = useTicketStore();
  const location = useLocation();
  const navigationType = useNavigationType();
  const path = location.pathname;
  const section = `/${path.split("/")[1] || "dashboard"}`;
  const tab = tabByPath[section] || "dashboard";
  React.useEffect(() => setActiveTab(tab), [setActiveTab, tab]);

  const pageTitle = React.useMemo(() => {
    if (path === "/" || path === "/dashboard") return "Dashboard";
    if (path === "/notifications") return "Notifications";
    const detail = path.match(/^\/(tickets|companies|employees|services)\/([^/]+)$/);
    if (detail) {
      const section = detail[1];
      if (detail[2] === "new") return `New ${section.slice(0, -1)}`;
      const id = decodeURIComponent(detail[2]);
      if (section === "tickets") return dataTitle(useTicketStore.getState().data.tickets.find((item) => item.id === id)?.code, "Ticket details");
      if (section === "companies") return dataTitle(useTicketStore.getState().data.companies.find((item) => item.id === id)?.name, "Company details");
      if (section === "employees") return dataTitle(useTicketStore.getState().data.employees.find((item) => item.id === id)?.name, "Employee details");
      return dataTitle(useTicketStore.getState().data.services.find((item) => item.id === id)?.name, "Service details");
    }
    return ({ "/tickets": "All Tickets", "/companies": "Companies", "/employees": "Employees", "/services": "Services", "/settings": "Settings" } as Record<string, string>)[path] || "Page unavailable";
  }, [path]);
  React.useEffect(() => { document.title = `${pageTitle} · TechNova`; }, [pageTitle]);
  React.useEffect(() => {
    if (navigationType === "POP") return;
    const heading = document.querySelector("main h1, main h2");
    if (heading instanceof HTMLElement) {
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
  }, [location.key, navigationType]);

  if (!isAuthenticated) return <LoginPage />;
  if (!ROLE_PERMISSIONS[activeRole].allowedTabs.includes(tab) || (tab === "settings" && !ROLE_PERMISSIONS[activeRole].canConfigureSettings)) return <AccessDenied destination="/dashboard" />;

  return <Layout>
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<DashboardView />} />
      <Route path="/notifications" element={<NotificationsView />} />
      <Route path="/tickets" element={<TicketRegistryView />} />
      <Route path="/tickets/new" element={ROLE_PERMISSIONS[activeRole].canCreateTicket ? <CreateTicketPage /> : <Navigate to="/tickets" replace />} />
      <Route path="/tickets/:ticketId" element={<TicketRegistryView />} />
      <Route path="/companies" element={<CompaniesView />} />
      <Route path="/companies/new" element={ROLE_PERMISSIONS[activeRole].canManageTeam ? <CreateCompanyPage /> : <Navigate to="/companies" replace />} />
      <Route path="/companies/:companyId" element={<CompaniesView />} />
      <Route path="/employees" element={<EmployeesView />} />
      <Route path="/employees/new" element={ROLE_PERMISSIONS[activeRole].canManageTeam ? <CreateEmployeePage /> : <Navigate to="/employees" replace />} />
      <Route path="/employees/:employeeId" element={<EmployeesView />} />
      <Route path="/services" element={<ServicesView />} />
      <Route path="/services/new" element={ROLE_PERMISSIONS[activeRole].canManageTeam ? <CreateServicePage /> : <Navigate to="/services" replace />} />
      <Route path="/services/:serviceId" element={<ServicesView />} />
      <Route path="/settings" element={<SettingsView />} />
      <Route path="*" element={<section role="status" className="m-6 rounded-xl border border-slate-200 bg-white p-8"><h1 className="text-xl font-bold text-slate-900">Page not found</h1><p className="mt-2 text-sm text-slate-600">This address does not match a TechNova page.</p><Link to="/dashboard" className="mt-4 inline-flex rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">Return to dashboard</Link></section>} />
    </Routes>
    <ToastNotificationContainer />
  </Layout>;
};

function dataTitle(value: string | undefined, fallback: string): string { return value || fallback; }

export const App: React.FC = () => <RouteContent />;
export default App;
