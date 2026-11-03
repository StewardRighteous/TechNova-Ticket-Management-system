import React, { useState } from 'react';
import type { Ticket, InboundChannel } from '../../types';
import { ChannelBadge, PriorityBadge, StatusBadge, TablePagination, TableHeaderSection } from '../common';
import { DashboardChannelFilters } from './DashboardChannelFilters';

interface DashboardTicketTableProps {
  tickets: Ticket[];
  onSelectTicket: (ticketId: string) => void;
  onExploreAll: () => void;
}

type SortField = 'code' | 'company' | 'title' | 'priority' | 'status';

export const DashboardTicketTable: React.FC<DashboardTicketTableProps> = ({
  tickets,
  onSelectTicket,
  onExploreAll,
}) => {
  const [search, setSearch] = useState('');
  const [channelFilter, setChannelFilter] = useState<'all' | InboundChannel>('all');
  const [sortField, setSortField] = useState<SortField>('priority');
  const [sortAsc, setSortAsc] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(true); }
  };

  const filtered = tickets.filter((t) => {
    if (channelFilter !== 'all' && t.channel !== channelFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        t.code.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.companyName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    if (sortField === 'code') cmp = a.code.localeCompare(b.code);
    else if (sortField === 'company') cmp = a.companyName.localeCompare(b.companyName);
    else if (sortField === 'title') cmp = a.title.localeCompare(b.title);
    else if (sortField === 'priority') cmp = a.priority.localeCompare(b.priority);
    else if (sortField === 'status') cmp = a.status.localeCompare(b.status);
    return sortAsc ? cmp : -cmp;
  });

  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-lg overflow-hidden">
      <TableHeaderSection
        title="Active Dispatch Queue"
        subtitle="Prioritized feed of customer tickets and incoming incidents"
        badgeText={`${filtered.length} Active`}
        searchQuery={search}
        onSearchChange={(s) => { setSearch(s); setPage(1); }}
        searchPlaceholder="Quick filter tickets..."
      >
        <DashboardChannelFilters
          channelFilter={channelFilter}
          setChannelFilter={(c) => { setChannelFilter(c); setPage(1); }}
          onExploreAll={onExploreAll}
        />
      </TableHeaderSection>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-900 text-white font-semibold uppercase tracking-wider text-[11px] select-none">
            <tr>
              <th className="py-2.5 px-5 cursor-pointer" onClick={() => handleSort('code')}>
                <span>Ticket</span>
              </th>
              <th className="py-2.5 px-3">Channel</th>
              <th className="py-2.5 px-3 cursor-pointer" onClick={() => handleSort('company')}>
                <span>Client</span>
              </th>
              <th className="py-2.5 px-3 cursor-pointer" onClick={() => handleSort('title')}>
                <span>Incident</span>
              </th>
              <th className="py-2.5 px-3 cursor-pointer" onClick={() => handleSort('priority')}>
                <span>Priority</span>
              </th>
              <th className="py-2.5 px-3">Assignee</th>
              <th className="py-2.5 px-3 cursor-pointer" onClick={() => handleSort('status')}>
                <span>Status</span>
              </th>
              <th className="py-2.5 px-5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {paginated.map((t) => (
              <tr key={t.id} className="hover:bg-indigo-50/40 transition-colors group">
                <td className="py-2.5 px-5 whitespace-nowrap font-mono font-bold text-indigo-700">
                  {t.code}
                </td>
                <td className="py-2.5 px-3 whitespace-nowrap">
                  <ChannelBadge channel={t.channel} showText={false} />
                </td>
                <td className="py-2.5 px-3 whitespace-nowrap font-semibold text-slate-800">
                  {t.companyName}
                </td>
                <td className="py-2.5 px-3 max-w-xs">
                  <span className="font-bold text-slate-900 block truncate group-hover:text-indigo-600 transition-colors">
                    {t.title}
                  </span>
                </td>
                <td className="py-2.5 px-3 whitespace-nowrap">
                  <PriorityBadge priority={t.priority} />
                </td>
                <td className="py-2.5 px-3 whitespace-nowrap text-slate-700">
                  <div className="flex items-center gap-1 text-[11px]">
                    <span className="material-symbols-outlined text-[14px] text-slate-400">person</span>
                    <span className="font-medium">{t.assignedToName}</span>
                  </div>
                </td>
                <td className="py-2.5 px-3 whitespace-nowrap">
                  <StatusBadge status={t.status} />
                </td>
                <td className="py-2.5 px-5 text-right whitespace-nowrap">
                  <button
                    onClick={() => onSelectTicket(t.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                  >
                    <span>View</span>
                    <span className="material-symbols-outlined text-[14px]">visibility</span>
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
