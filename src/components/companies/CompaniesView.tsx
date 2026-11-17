import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTicketStore } from "../../store/barrel";
import { CompanyTable } from "./CompanyTable";
import { CompanyDetailHero } from "./CompanyDetailHero";
import { filterCompaniesByRole } from "../../utils/barrel";
import { Breadcrumb } from "../common/barrel";

export const CompaniesView: React.FC = () => {
  const { data, activeRole, currentUser, updateCompany, addToast } = useTicketStore();
  const navigate = useNavigate();
  const { companyId: activeCompanyId } = useParams<{ companyId: string }>();

  const roleCompanies = filterCompaniesByRole(
    data.companies,
    activeRole,
    currentUser?.name,
  );
  const selectedCompany =
    roleCompanies.find((c) => c.id === activeCompanyId) ||
    data.companies.find((c) => c.id === activeCompanyId);

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
      {selectedCompany ? (
        <>
          <Breadcrumb
            section="Companies"
            current={selectedCompany.name}
            onBack={() => navigate("/companies")}
          />
          <CompanyDetailHero
            company={selectedCompany}
            onBack={() => navigate("/companies")}
            onUpdateCompany={handleUpdateCompany}
            tickets={data.tickets.filter((ticket) => ticket.companyId === selectedCompany.id && !["Resolved", "Closed"].includes(ticket.status))}
            onOpenTicket={(ticketId) => navigate(`/tickets/${encodeURIComponent(ticketId)}`)}
          />
        </>
      ) : (
        <CompanyTable
          companies={roleCompanies}
          onViewCompany={(id) => navigate(`/companies/${encodeURIComponent(id)}`)}
        />
      )}
    </div>
  );
};
