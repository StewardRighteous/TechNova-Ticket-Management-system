import React from 'react';
import { useTicketStore } from '../../store';
import { CompanyCard } from './CompanyCard';

export const CompaniesView: React.FC = () => {
  const { data, searchQuery } = useTicketStore();

  const filteredCompanies = data.companies.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.code.toLowerCase().includes(q) ||
      c.contactName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-8 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Client Companies & Accounts</h1>
          <p className="text-xs text-slate-500">
            SLA contracts, customer contact matrix, and multi-channel preferences
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700">
            {filteredCompanies.length} Registered Enterprise Accounts
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCompanies.map((comp) => (
          <CompanyCard key={comp.id} company={comp} />
        ))}
      </div>
    </div>
  );
};
