import { Dialog, ActionLink, Heading } from "./ui/barrel";
import React from "react";
import { Navigate, Route, Routes, useLocation, useNavigate, useNavigationType } from "react-router-dom";
import { useTicketStore } from "./store/barrel";
import { Layout } from "./components/layout/barrel";
import { LoginPage } from "./components/auth/barrel";
import { DashboardView } from "./components/dashboard/barrel";
import { ClientNotificationPage, TicketRegistryView } from "./components/tickets/barrel";
import { CreateTicketPage } from "./components/tickets/CreateTicketPage";
import { CompaniesView } from "./components/companies/barrel";
import { CreateCompanyPage } from "./components/companies/CreateCompanyPage";
import { EmployeesView } from "./components/employees/barrel";
import { CreateEmployeePage } from "./components/employees/CreateEmployeePage";
import { ServicesView } from "./components/services/barrel";
import { CreateServicePage } from "./components/services/CreateServicePage";
import { SettingsView } from "./components/settings/barrel";
import { NotificationsView } from "./components/notifications/NotificationsView";
import { LatestUpdatesView } from "./components/dashboard/LatestUpdatesView";
import { ToastNotificationContainer } from "./components/layout/ToastNotificationContainer";
import { canAccessService, canAccessTicket, ROLE_PERMISSIONS } from "./utils/barrel";

const tabByPath: Record<string, string> = {
  "/dashboard": "dashboard", "/tickets": "tickets", "/companies": "companies",
  "/employees": "employees", "/services": "services", "/settings": "settings", "/notifications": "notifications",
  "/profile": "profile", "/latest-updates": "dashboard",
};

const AccessDenied: React.FC<{ destination: string }> = ({ destination }) => (
  <Layout>
    <section role="status" className="m-6 rounded-xl border border-amber-200 bg-amber-50 p-6">
      <Heading as="h1" variant="notice">This section isn’t available</Heading>
      <p className="mt-2 text-sm text-slate-700">Your current role doesn’t have access to this page.</p>
      <ActionLink to={destination} className="mt-4 inline-flex rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">Return to an available page</ActionLink>
    </section>
  </Layout>
);

interface CreateModalRouteProps {
  section: "tickets" | "companies" | "services" | "employees";
  title: string;
  children: React.ReactNode;
  background: React.ReactNode;
  showCloseButton?: boolean;
}

const CreateModalRoute: React.FC<CreateModalRouteProps> = ({ section, title, children, background, showCloseButton = true }) => {
  const navigate = useNavigate();

  const close = () => navigate(`/${section}`);
  return <>
    {background}
    <Dialog section={section} title={title} onClose={close} width="medium" showCloseButton={showCloseButton} className="create-modal-shell">
      {children}
    </Dialog>
  </>;
};

const TicketCreateModalRoute: React.FC = () => {
  const [title, setTitle] = React.useState("Create a new ticket");
  return <CreateModalRoute section="tickets" title={title} showCloseButton={title === "Ticket created"} background={<TicketRegistryView />}><CreateTicketPage onCreated={() => setTitle("Ticket created")} /></CreateModalRoute>;
};

const RouteContent: React.FC = () => {
  const { data, isAuthenticated, activeRole, currentUser, setActiveTab } = useTicketStore();
  const location = useLocation();
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const lastFocusedPathRef = React.useRef<string | null>(null);
  const path = location.pathname;
  const section = `/${path.split("/")[1] || "dashboard"}`;
  const tab = tabByPath[section] || "dashboard";
  const permissions = ROLE_PERMISSIONS[activeRole];
  const home = permissions.canManageTeam ? "/dashboard" : "/tickets";
  const canAccessTab = permissions.allowedTabs.includes(tab);
  React.useEffect(() => setActiveTab(tab), [setActiveTab, tab]);

  const pageTitle = React.useMemo(() => {
    if (!isAuthenticated) return "Employee sign in";
    if (path === "/" || path === "/dashboard") return home === "/dashboard" ? "Dashboard" : "My Tickets";
    if (!canAccessTab) return "Page unavailable";
    if (path === "/notifications") return "Notifications";
    if (path === "/latest-updates") return "Latest updates";
    if (path.endsWith("/notify-client")) return "Notify client";
    const detail = path.match(/^\/(tickets|companies|employees|services)\/([^/]+)$/);
    if (detail) {
      const section = detail[1];
      if (detail[2] === "new") return `New ${section.slice(0, -1)}`;
      const id = decodeURIComponent(detail[2]);
      if (section === "tickets") return data.tickets.find((item) => item.id === id && canAccessTicket(item, activeRole, currentUser?.id))?.code || "Ticket details";
      if (section === "companies") return data.companies.find((item) => item.id === id)?.name || "Company details";
      if (section === "employees") return data.employees.find((item) => item.id === id)?.name || "Employee details";
      return data.services.find((item) => item.id === id && currentUser && canAccessService(item, currentUser))?.name || "Service details";
    }
    return ({ "/tickets": home === "/dashboard" ? "All Tickets" : "My Tickets", "/companies": "Companies", "/employees": "Employees", "/services": "Services", "/settings": "Settings", "/profile": "Profile" } as Record<string, string>)[path] || "Page unavailable";
  }, [path, data, isAuthenticated, activeRole, currentUser, home, canAccessTab]);
  React.useEffect(() => { document.title = `${pageTitle} · TechNova`; }, [pageTitle]);
  React.useEffect(() => {
    // Query-string updates (such as table search) must not steal focus from
    // the active control. Restore heading focus only after a path changes.
    if (lastFocusedPathRef.current === location.pathname) return;
    lastFocusedPathRef.current = location.pathname;
    if (navigationType === "POP") return;
    const heading = document.querySelector("main h1, main h2");
    if (heading instanceof HTMLElement) {
      heading.tabIndex = -1;
      heading.focus({ preventScroll: true });
    }
  }, [location.pathname, navigationType]);

  if (!isAuthenticated) {
    return <LoginPage onSignedIn={() => {
      const signedInPermissions = ROLE_PERMISSIONS[useTicketStore.getState().activeRole];
      if (!signedInPermissions.allowedTabs.includes(tab)) {
        navigate(signedInPermissions.canManageTeam ? "/dashboard" : "/tickets", { replace: true });
      }
    }} />;
  }
  if (path === "/" || (path === "/dashboard" && home !== "/dashboard")) return <Navigate to={home} replace />;
  if (!canAccessTab) return <AccessDenied destination={home} />;

  return <Layout>
    <Routes>
      <Route path="/dashboard" element={<DashboardView />} />
      <Route path="/notifications" element={<NotificationsView />} />
      <Route path="/latest-updates" element={<LatestUpdatesView />} />
      <Route path="/tickets" element={<TicketRegistryView />} />
      <Route path="/tickets/new" element={ROLE_PERMISSIONS[activeRole].canCreateTicket ? <TicketCreateModalRoute /> : <Navigate to="/tickets" replace />} />
      <Route path="/tickets/:ticketId/notify-client" element={<ClientNotificationPage />} />
      <Route path="/tickets/:ticketId" element={<TicketRegistryView />} />
      <Route path="/companies" element={<CompaniesView />} />
      <Route path="/companies/new" element={ROLE_PERMISSIONS[activeRole].canManageTeam ? <CreateModalRoute section="companies" title="Add a company" background={<CompaniesView />}><CreateCompanyPage /></CreateModalRoute> : <Navigate to="/companies" replace />} />
      <Route path="/companies/:companyId" element={<CompaniesView />} />
      <Route path="/employees" element={<EmployeesView />} />
      <Route path="/employees/new" element={ROLE_PERMISSIONS[activeRole].canManageTeam ? <CreateModalRoute section="employees" title="Add an employee" background={<EmployeesView />}><CreateEmployeePage /></CreateModalRoute> : <Navigate to="/employees" replace />} />
      <Route path="/employees/:employeeId" element={<EmployeesView />} />
      <Route path="/profile" element={<EmployeesView personal />} />
      <Route path="/services" element={<ServicesView />} />
      <Route path="/services/new" element={ROLE_PERMISSIONS[activeRole].canManageTeam ? <CreateModalRoute section="services" title="Add a service" background={<ServicesView />}><CreateServicePage /></CreateModalRoute> : <Navigate to="/services" replace />} />
      <Route path="/services/:serviceId" element={<ServicesView />} />
      <Route path="/settings" element={<SettingsView />} />
      <Route path="*" element={<section role="status" className="m-6 rounded-xl border border-slate-200 bg-white p-8"><Heading as="h1" variant="plain" className="text-xl font-bold text-slate-900">Page not found</Heading><p className="mt-2 text-sm text-slate-600">This address does not match a TechNova page.</p><ActionLink to={home} className="mt-4 inline-flex rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">Return to workspace</ActionLink></section>} />
    </Routes>
    <ToastNotificationContainer />
  </Layout>;
};

export const App: React.FC = () => <RouteContent />;
export default App;
