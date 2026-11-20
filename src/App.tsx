import React from "react";
import { Link, Navigate, Route, Routes, useLocation, useNavigate, useNavigationType } from "react-router-dom";
import { useTicketStore } from "./store/barrel";
import { Layout } from "./components/common/layout/barrel";
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

interface CreateModalRouteProps {
  section: "tickets" | "companies" | "services" | "employees";
  title: string;
  children: React.ReactNode;
  background: React.ReactNode;
  showCloseButton?: boolean;
}

const CreateModalRoute: React.FC<CreateModalRouteProps> = ({ section, title, children, background, showCloseButton = true }) => {
  const navigate = useNavigate();

  React.useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") navigate(`/${section}`);
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [navigate, section]);

  return <>
    {background}
    <div className="fixed inset-0 z-[60] flex items-center justify-center overflow-y-auto bg-slate-950/55 p-3 sm:p-6" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) navigate(`/${section}`); }}>
      <section role="dialog" aria-modal="true" aria-labelledby="create-modal-title" className="create-modal-shell relative flex max-h-[calc(100vh-1.5rem)] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl sm:max-h-[calc(100vh-3rem)]">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3.5 sm:px-7">
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#0e858d]">{section}</p>
            <h1 id="create-modal-title" className="truncate text-xl font-bold tracking-[-0.02em] text-[#1f2041] sm:text-2xl">{title}</h1>
          </div>
          {showCloseButton && <button type="button" onClick={() => navigate(`/${section}`)} aria-label="Close" title="Close" className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-indigo focus-visible:ring-offset-2">
            <span aria-hidden="true" className="material-symbols-outlined text-[22px]">close</span>
          </button>}
        </div>
        <div className="min-h-0 overflow-y-auto">{children}</div>
      </section>
    </div>
  </>;
};

const TicketCreateModalRoute: React.FC = () => {
  const [title, setTitle] = React.useState("Create a new ticket");
  return <CreateModalRoute section="tickets" title={title} showCloseButton={title === "Ticket created"} background={<TicketRegistryView />}><CreateTicketPage onCreated={() => setTitle("Ticket created")} /></CreateModalRoute>;
};

const RouteContent: React.FC = () => {
  const { isAuthenticated, activeRole, setActiveTab } = useTicketStore();
  const location = useLocation();
  const navigationType = useNavigationType();
  const lastFocusedPathRef = React.useRef<string | null>(null);
  const path = location.pathname;
  const section = `/${path.split("/")[1] || "dashboard"}`;
  const tab = tabByPath[section] || "dashboard";
  React.useEffect(() => setActiveTab(tab), [setActiveTab, tab]);

  const pageTitle = React.useMemo(() => {
    if (path === "/" || path === "/dashboard") return "Dashboard";
    if (path === "/notifications") return "Notifications";
    if (path === "/latest-updates") return "Latest updates";
    if (path.endsWith("/notify-client")) return "Notify client";
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

  if (!isAuthenticated) return <LoginPage />;
  if (!ROLE_PERMISSIONS[activeRole].allowedTabs.includes(tab) || (tab === "settings" && !ROLE_PERMISSIONS[activeRole].canConfigureSettings)) return <AccessDenied destination="/dashboard" />;

  return <Layout>
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
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
      <Route path="/services" element={<ServicesView />} />
      <Route path="/services/new" element={ROLE_PERMISSIONS[activeRole].canManageTeam ? <CreateModalRoute section="services" title="Add a service" background={<ServicesView />}><CreateServicePage /></CreateModalRoute> : <Navigate to="/services" replace />} />
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
