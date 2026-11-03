import React, { useState } from 'react';
import type { Company } from '../../types';
import { ChannelBadge, TablePagination, TableHeaderSection } from '../common';

interface CompanyTableProps {
  companies: Company[];
  onViewCompany: (companyId: string) => void;
}

type SortField = 'name' | 'tier' | 'contact' | 'tickets' | 'sla';

export const CompanyTable: React.FC<CompanyTableProps> = ({ companies, onViewCompany }) => {
  const [search, setSearch] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(true); }
  };

  const filtered = companies.filter((c) => {
    if (tierFilter !== 'all' && !c.tier.includes(tierFilter)) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.contactName.toLowerCase().includes(q) ||
        c.accountManager.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    if (sortField === 'name') cmp = a.name.localeCompare(b.name);
    else if (sortField === 'tier') cmp = a.tier.localeCompare(b.tier);
    else if (sortField === 'contact') cmp = a.contactName.localeCompare(b.contactName);
    else if (sortField === 'tickets') cmp = a.activeTickets - b.activeTickets;
    else if (sortField === 'sla') cmp = a.slaResponseTime.localeCompare(b.slaResponseTime);
    return sortAsc ? cmp : -cmp;
  });

  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <TableHeaderSection
        title="Client Companies & Accounts"
        subtitle="Enterprise SLA contracts, preferred channels, and client relationship matrices"
        badgeText={`${filtered.length} Enterprise Clients`}
        searchQuery={search}
        onSearchChange={(s) => { setSearch(s); setPage(1); }}
        searchPlaceholder="Filter companies or contacts..."
      >
        <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs">
          <button
            onClick={() => { setTierFilter('all'); setPage(1); }}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              tierFilter === 'all' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'
            }`}
          >
            All
          </button>
          <button
            onClick={() => { setTierFilter('Tier 1'); setPage(1); }}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              tierFilter === 'Tier 1' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'
            }`}
          >
            Tier 1
          </button>
          <button
            onClick={() => { setTierFilter('Tier 2'); setPage(1); }}
            className={`px-3 py-1 rounded-lg font-semibold transition-all ${
              tierFilter === 'Tier 2' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600'
            }`}
          >
            Tier 2
          </button>
        </div>
      </TableHeaderSection>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-900 text-white font-semibold uppercase tracking-wider text-[11px] select-none">
            <tr>
              <th className="py-3 px-6 cursor-pointer" onClick={() => handleSort('name')}>
                <div className="flex items-center gap-1">
                  <span>Company Name</span>
                  <span className="material-symbols-outlined text-[15px] opacity-70">
                    {sortField === 'name' ? (sortAsc ? 'arrow_drop_up' : 'arrow_drop_down') : 'unfold_more'}
                  </span>
                </div>
              </th>
              <th className="py-3 px-4 cursor-pointer" onClick={() => handleSort('tier')}>
                <span>Tier</span>
              </th>
              <th className="py-3 px-4 cursor-pointer" onClick={() => handleSort('contact')}>
                <span>Primary Executive</span>
              </th>
              <th className="py-3 px-4">Direct Comms</th>
              <th className="py-3 px-4 cursor-pointer" onClick={() => handleSort('sla')}>
                <span>SLA Target</span>
              </th>
              <th className="py-3 px-4 cursor-pointer" onClick={() => handleSort('tickets')}>
                <span>Tickets</span>
              </th>
              <th className="py-3 px-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {paginated.map((c) => (
              <tr key={c.id} className="hover:bg-indigo-50/40 transition-colors group">
                <td className="py-3.5 px-6 whitespace-nowrap">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 font-bold flex items-center justify-center text-xs">
                      {c.code}
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 block group-hover:text-indigo-600 transition-colors">
                        {c.name}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">Lead: {c.accountManager}</span>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    {c.tier}
                  </span>
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <span className="font-semibold text-slate-800 block">{c.contactName}</span>
                  <span className="text-[10px] text-slate-400">{c.contactRole}</span>
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-1.5 text-slate-600">
                    <span className="material-symbols-outlined text-[13px] text-blue-500">mail</span>
                    <span className="font-mono text-[11px]">{c.contactEmail}</span>
                    <ChannelBadge channel={c.preferredChannel} showText={false} />
                  </div>
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap font-mono font-bold text-indigo-700">
                  {c.slaResponseTime}
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap font-mono font-bold text-slate-800">
                  {c.activeTickets}
                </td>
                <td className="py-3.5 px-6 text-right whitespace-nowrap">
                  <button
                    onClick={() => onViewCompany(c.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                  >
                    <span>View</span>
                    <span className="material-symbols-outlined text-[15px]">visibility</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <TablePagination
        totalItems={filtered.length}
        currentPage={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        pageSizeOptions={[5, 10]}
      />
    </div>
  );
};
