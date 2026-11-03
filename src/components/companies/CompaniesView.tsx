import React, { useState } from 'react';
import { useTicketStore } from '../../store';
import { CompanyTable } from './CompanyTable';
import { CompanyDetailHero } from './CompanyDetailHero';
import { filterCompaniesByRole } from '../../utils';
import type { Company } from '../../types';

export const CompaniesView: React.FC = () => {
  const { data, activeRole, currentUser } = useTicketStore();
  const [activeCompanyId, setActiveCompanyId] = useState<string | null>(null);

  const roleCompanies = filterCompaniesByRole(data.companies, activeRole, currentUser?.name);
  const selectedCompany = roleCompanies.find((c) => c.id === activeCompanyId) || data.companies.find((c) => c.id === activeCompanyId);

  const handleUpdateCompany = (updates: Partial<Company>) => {
    if (!activeCompanyId) return;
    const updated = data.companies.map((c) => {
      if (c.id === activeCompanyId) {
        return { ...c, ...updates };
      }
      return c;
    });
    useTicketStore.setState({
      data: { ...data, companies: updated }
    });
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      {selectedCompany ? (
        <CompanyDetailHero
          company={selectedCompany}
          onBack={() => setActiveCompanyId(null)}
          onUpdateCompany={handleUpdateCompany}
        />
      ) : (
        <CompanyTable
          companies={roleCompanies}
          onViewCompany={(id) => setActiveCompanyId(id)}
        />
      )}
    </div>
  );
};
