import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTicketStore } from "../../store/barrel";
import { CompanyTable } from "./CompanyTable";
import { CompanyDetailHero } from "./CompanyDetailHero";
import { filterCompaniesByRole, filterTicketsByRole } from "../../utils/barrel";

export const CompaniesView: React.FC = () => {
  const { data, activeRole, currentUser, updateCompany, addToast } = useTicketStore();
  const navigate = useNavigate();
  const { companyId: activeCompanyId } = useParams<{ companyId: string }>();

  const roleCompanies = filterCompaniesByRole(
    data.companies,
    activeRole,
    currentUser?.name,
  );
  const roleTickets = filterTicketsByRole(data.tickets, activeRole, currentUser?.id, roleCompanies.map((company) => company.id));
  const selectedCompany = roleCompanies.find((c) => c.id === activeCompanyId);

  const handleUpdateCompany = (
    updates: Partial<import("../../types/barrel").Company>,
  ) => {
    if (activeCompanyId) {
      updateCompany(activeCompanyId, updates);
      addToast("Company changes saved", "success");
    }
  };

  return (
    <div className="space-y-4 p-2">
      {activeCompanyId && !selectedCompany ? (
        <section role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-6">
          <h1 className="text-lg font-semibold text-slate-900">Company unavailable</h1>
          <p className="mt-2 text-sm text-slate-700">This company may not exist or may not be available to your role.</p>
          <button type="button" onClick={() => navigate("/companies")} className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">Return to companies</button>
        </section>
      ) : <>
        {selectedCompany && <>
          <CompanyDetailHero
            company={selectedCompany}
            canEdit={activeRole === "operations_manager" || activeRole === "management"}
            onBack={() => navigate("/companies")}
            onUpdateCompany={handleUpdateCompany}
            tickets={roleTickets.filter((ticket) => ticket.companyId === selectedCompany.id && !["Resolved", "Closed"].includes(ticket.status))}
            onOpenTicket={(ticketId) => navigate(`/tickets/${encodeURIComponent(ticketId)}`)}
          />
        </>}
        <div hidden={Boolean(activeCompanyId)}><CompanyTable
          companies={roleCompanies}
          onViewCompany={(id) => navigate(`/companies/${encodeURIComponent(id)}`)}
          onCreateNew={activeRole === "operations_manager" || activeRole === "management" ? () => navigate("/companies/new") : undefined}
        /></div>
      </>}
    </div>
  );
};
