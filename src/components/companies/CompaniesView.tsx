import React, { useState } from "react";
import { useTicketStore } from "../../store";
import { CompanyTable } from "./CompanyTable";
import { CompanyDetailHero } from "./CompanyDetailHero";
import { filterCompaniesByRole } from "../../utils";
import { Breadcrumb } from "../common";

export const CompaniesView: React.FC = () => {
  const { data, activeRole, currentUser, updateCompany, addToast, setActiveTab, setSelectedTicketId } = useTicketStore();
  const [activeCompanyId, setActiveCompanyId] = useState<string | null>(null);

  const roleCompanies = filterCompaniesByRole(
    data.companies,
    activeRole,
    currentUser?.name,
  );
  const selectedCompany =
    roleCompanies.find((c) => c.id === activeCompanyId) ||
    data.companies.find((c) => c.id === activeCompanyId);

  const handleUpdateCompany = (
    updates: Partial<import("../../types").Company>,
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
            onBack={() => setActiveCompanyId(null)}
          />
          <CompanyDetailHero
            company={selectedCompany}
            onBack={() => setActiveCompanyId(null)}
            onUpdateCompany={handleUpdateCompany}
            tickets={data.tickets.filter((ticket) => ticket.companyId === selectedCompany.id && !["Resolved", "Closed"].includes(ticket.status))}
            onOpenTicket={(ticketId) => { setSelectedTicketId(ticketId); setActiveTab("tickets"); }}
          />
        </>
      ) : (
        <CompanyTable
          companies={roleCompanies}
          onViewCompany={(id) => setActiveCompanyId(id)}
        />
      )}
    </div>
  );
};
