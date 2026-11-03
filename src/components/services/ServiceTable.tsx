import React, { useState } from 'react';
import type { ServiceLine } from '../../types';
import { TablePagination, TableHeaderSection } from '../common';

interface ServiceTableProps {
  services: ServiceLine[];
  onViewService: (serviceId: string) => void;
}

type SortField = 'name' | 'code' | 'lead' | 'sla' | 'tickets' | 'uptime';

export const ServiceTable: React.FC<ServiceTableProps> = ({ services, onViewService }) => {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else {
      setSortField(field);
      setSortAsc(true);
    }
  };

  const filtered = services.filter((s) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      s.code.toLowerCase().includes(q) ||
      s.lead.toLowerCase().includes(q) ||
      s.department.toLowerCase().includes(q)
    );
  });

  const sorted = [...filtered].sort((a, b) => {
    let comparison = 0;
    if (sortField === 'name') comparison = a.name.localeCompare(b.name);
    else if (sortField === 'code') comparison = a.code.localeCompare(b.code);
    else if (sortField === 'lead') comparison = a.lead.localeCompare(b.lead);
    else if (sortField === 'sla') comparison = a.slaTarget.localeCompare(b.slaTarget);
    else if (sortField === 'uptime') comparison = a.uptime.localeCompare(b.uptime);
    else if (sortField === 'tickets') comparison = a.activeTickets - b.activeTickets;
    return sortAsc ? comparison : -comparison;
  });

  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <TableHeaderSection
        title="Services & Operational Departments"
        subtitle="Core IT capabilities: Custom Web Apps, Cloud Infra, ERP, 24/7 Support, & IT Consulting"
        badgeText={`${filtered.length} Active SLA Lines`}
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Filter services or lead..."
      />

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-900 text-white font-semibold uppercase tracking-wider text-[11px] select-none">
            <tr>
              <th className="py-3 px-6 cursor-pointer" onClick={() => handleSort('code')}>
                <div className="flex items-center gap-1">
                  <span>Service Code</span>
                  <span className="material-symbols-outlined text-[15px] opacity-70">
                    {sortField === 'code' ? (sortAsc ? 'arrow_drop_up' : 'arrow_drop_down') : 'unfold_more'}
                  </span>
                </div>
              </th>
              <th className="py-3 px-4 cursor-pointer" onClick={() => handleSort('name')}>
                <div className="flex items-center gap-1">
                  <span>Service Name</span>
                  <span className="material-symbols-outlined text-[15px] opacity-70">
                    {sortField === 'name' ? (sortAsc ? 'arrow_drop_up' : 'arrow_drop_down') : 'unfold_more'}
                  </span>
                </div>
              </th>
              <th className="py-3 px-4 cursor-pointer" onClick={() => handleSort('lead')}>
                <div className="flex items-center gap-1">
                  <span>Service Lead</span>
                  <span className="material-symbols-outlined text-[15px] opacity-70">
                    {sortField === 'lead' ? (sortAsc ? 'arrow_drop_up' : 'arrow_drop_down') : 'unfold_more'}
                  </span>
                </div>
              </th>
              <th className="py-3 px-4 cursor-pointer" onClick={() => handleSort('sla')}>
                <div className="flex items-center gap-1">
                  <span>SLA Target</span>
                  <span className="material-symbols-outlined text-[15px] opacity-70">
                    {sortField === 'sla' ? (sortAsc ? 'arrow_drop_up' : 'arrow_drop_down') : 'unfold_more'}
                  </span>
                </div>
              </th>
              <th className="py-3 px-4 cursor-pointer" onClick={() => handleSort('uptime')}>
                <div className="flex items-center gap-1">
                  <span>Uptime</span>
                  <span className="material-symbols-outlined text-[15px] opacity-70">
                    {sortField === 'uptime' ? (sortAsc ? 'arrow_drop_up' : 'arrow_drop_down') : 'unfold_more'}
                  </span>
                </div>
              </th>
              <th className="py-3 px-4 cursor-pointer" onClick={() => handleSort('tickets')}>
                <div className="flex items-center gap-1">
                  <span>Active Tickets</span>
                  <span className="material-symbols-outlined text-[15px] opacity-70">
                    {sortField === 'tickets' ? (sortAsc ? 'arrow_drop_up' : 'arrow_drop_down') : 'unfold_more'}
                  </span>
                </div>
              </th>
              <th className="py-3 px-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {paginated.map((srv) => (
              <tr key={srv.id} className="hover:bg-indigo-50/40 transition-colors group">
                <td className="py-3.5 px-6 whitespace-nowrap font-mono font-bold text-indigo-700">
                  {srv.code}
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div>
                    <span className="font-bold text-slate-900 block group-hover:text-indigo-600 transition-colors">
                      {srv.name}
                    </span>
                    <span className="text-[11px] text-slate-400">{srv.department}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-slate-400 text-[16px]">person</span>
                    <span className="font-semibold text-slate-800">{srv.lead}</span>
                  </div>
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap font-mono font-bold text-indigo-700">
                  {srv.slaTarget}
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    {srv.uptime}
                  </span>
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap font-mono font-bold text-slate-800">
                  {srv.activeTickets}
                </td>
                <td className="py-3.5 px-6 text-right whitespace-nowrap">
                  <button
                    onClick={() => onViewService(srv.id)}
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
