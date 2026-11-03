import React, { useState } from 'react';
import { useTicketStore } from '../../store';
import { CompanyTable } from './CompanyTable';
import { CompanyDetailHero } from './CompanyDetailHero';
import type { Company } from '../../types';

export const CompaniesView: React.FC = () => {
  const { data } = useTicketStore();
  const [activeCompanyId, setActiveCompanyId] = useState<string | null>(null);

  const selectedCompany = data.companies.find((c) => c.id === activeCompanyId);

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
          companies={data.companies}
          onViewCompany={(id) => setActiveCompanyId(id)}
        />
      )}
    </div>
  );
};
