import { Button, Heading } from "../../ui/barrel";
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTicketStore } from "../../store/barrel";
import { CompanyTable } from "./CompanyTable";
import { CompanyDetailHero } from "./CompanyDetailHero";
import { canAccessService, filterTicketsByRole, ROLE_PERMISSIONS } from "../../utils/barrel";

export const CompaniesView: React.FC = () => {
  const { data, activeRole, currentUser, updateCompany, deleteCompany, addToast } = useTicketStore();
  const navigate = useNavigate();
  const { companyId: activeCompanyId } = useParams<{ companyId: string }>();

  const canManageTeam = ROLE_PERMISSIONS[activeRole].canManageTeam;
  const roleTickets = filterTicketsByRole(data.tickets, activeRole, currentUser?.id);
  const selectedCompany = data.companies.find((company) => company.id === activeCompanyId);
  const openTickets = roleTickets.filter((ticket) => ticket.status !== "Resolved" && ticket.status !== "Closed");

  const handleUpdateCompany = (
    updates: Partial<import("../../types/barrel").Company>,
  ) => {
    if (activeCompanyId) {
      updateCompany(activeCompanyId, updates);
      addToast("Company changes saved", "success");
    }
  };

  const handleDeleteCompany = (permanent: boolean) => {
    if (!activeCompanyId) return;
    if (permanent) {
      deleteCompany(activeCompanyId);
      addToast("Company and related tickets permanently deleted.", "success");
      navigate("/companies");
      return;
    }
    updateCompany(activeCompanyId, { status: "Inactive" });
    addToast("Company marked inactive.", "success");
  };

  return (
    <div className="space-y-4 p-2">
      {activeCompanyId && !selectedCompany ? (
        <section role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-6">
          <Heading as="h1" variant="notice">Company unavailable</Heading>
          <p className="mt-2 text-sm text-slate-700">This company may not exist or may not be available to your role.</p>
          <Button tone="plain" type="button" onClick={() => navigate("/companies")} className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">Return to companies</Button>
        </section>
      ) : <>
        {selectedCompany && <>
          <CompanyDetailHero
            key={selectedCompany.id}
            company={selectedCompany}
            canEdit={canManageTeam}
            onUpdateCompany={handleUpdateCompany}
            onDeleteCompany={handleDeleteCompany}
            tickets={roleTickets.filter((ticket) => ticket.companyId === selectedCompany.id)}
            onOpenTicket={(ticketId) => navigate(`/tickets/${encodeURIComponent(ticketId)}`)}
            services={data.services}
            companies={data.companies}
            employees={data.employees}
            getServiceHref={(service) => currentUser && canAccessService(service, currentUser)
              ? `/services/${encodeURIComponent(service.id)}?tab=contracts` : undefined}
          />
        </>}
        <div hidden={Boolean(activeCompanyId)}><CompanyTable
          companies={data.companies.map((company) => ({ ...company, activeTickets: openTickets.filter((ticket) => ticket.companyId === company.id).length }))}
          onViewCompany={(id) => navigate(`/companies/${encodeURIComponent(id)}`)}
          onCreateNew={canManageTeam ? () => navigate("/companies/new") : undefined}
        /></div>
      </>}
    </div>
  );
};
