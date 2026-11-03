import React, { useState } from 'react';
import type { Ticket, InboundChannel } from '../../types';
import { ChannelBadge, PriorityBadge, StatusBadge, TablePagination, TableHeaderSection } from '../common';
import { TicketTableFilters } from './TicketTableFilters';

interface TicketTableProps {
  tickets: Ticket[];
  onViewTicket: (ticketId: string) => void;
  onCreateNew: () => void;
}

type SortField = 'code' | 'title' | 'company' | 'priority' | 'status' | 'time';

export const TicketTable: React.FC<TicketTableProps> = ({ tickets, onViewTicket, onCreateNew }) => {
  const [search, setSearch] = useState('');
  const [channelFilter, setChannelFilter] = useState<'all' | InboundChannel>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('time');
  const [sortAsc, setSortAsc] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(5);

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortAsc(!sortAsc);
    else { setSortField(field); setSortAsc(true); }
  };

  const filtered = tickets.filter((t) => {
    if (channelFilter !== 'all' && t.channel !== channelFilter) return false;
    if (priorityFilter !== 'all' && !t.priority.includes(priorityFilter)) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        t.code.toLowerCase().includes(q) ||
        t.title.toLowerCase().includes(q) ||
        t.companyName.toLowerCase().includes(q) ||
        t.assignedToName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    let cmp = 0;
    if (sortField === 'code') cmp = a.code.localeCompare(b.code);
    else if (sortField === 'title') cmp = a.title.localeCompare(b.title);
    else if (sortField === 'company') cmp = a.companyName.localeCompare(b.companyName);
    else if (sortField === 'priority') cmp = a.priority.localeCompare(b.priority);
    else if (sortField === 'status') cmp = a.status.localeCompare(b.status);
    else if (sortField === 'time') cmp = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    return sortAsc ? cmp : -cmp;
  });

  const paginated = sorted.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <TableHeaderSection
        title="Master Ticket Registry"
        subtitle="Live multi-channel customer requests & issue resolution pipeline"
        badgeText={`${filtered.length} In Queue`}
        searchQuery={search}
        onSearchChange={(s) => { setSearch(s); setPage(1); }}
        searchPlaceholder="Filter by ID, issue, client..."
      >
        <TicketTableFilters
          channelFilter={channelFilter}
          setChannelFilter={(c) => { setChannelFilter(c); setPage(1); }}
          priorityFilter={priorityFilter}
          setPriorityFilter={(p) => { setPriorityFilter(p); setPage(1); }}
          onCreateNew={onCreateNew}
        />
      </TableHeaderSection>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead className="bg-slate-900 text-white font-semibold uppercase tracking-wider text-[11px] select-none">
            <tr>
              <th className="py-3 px-6 cursor-pointer" onClick={() => handleSort('code')}>
                <div className="flex items-center gap-1">
                  <span>Ticket ID</span>
                  <span className="material-symbols-outlined text-[15px] opacity-70">
                    {sortField === 'code' ? (sortAsc ? 'arrow_drop_up' : 'arrow_drop_down') : 'unfold_more'}
                  </span>
                </div>
              </th>
              <th className="py-3 px-4">Channel</th>
              <th className="py-3 px-4 cursor-pointer" onClick={() => handleSort('company')}>
                <div className="flex items-center gap-1">
                  <span>Client Company</span>
                  <span className="material-symbols-outlined text-[15px] opacity-70">
                    {sortField === 'company' ? (sortAsc ? 'arrow_drop_up' : 'arrow_drop_down') : 'unfold_more'}
                  </span>
                </div>
              </th>
              <th className="py-3 px-4 cursor-pointer" onClick={() => handleSort('title')}>
                <div className="flex items-center gap-1">
                  <span>Incident Summary</span>
                  <span className="material-symbols-outlined text-[15px] opacity-70">
                    {sortField === 'title' ? (sortAsc ? 'arrow_drop_up' : 'arrow_drop_down') : 'unfold_more'}
                  </span>
                </div>
              </th>
              <th className="py-3 px-4 cursor-pointer" onClick={() => handleSort('priority')}>
                <div className="flex items-center gap-1">
                  <span>Priority</span>
                  <span className="material-symbols-outlined text-[15px] opacity-70">
                    {sortField === 'priority' ? (sortAsc ? 'arrow_drop_up' : 'arrow_drop_down') : 'unfold_more'}
                  </span>
                </div>
              </th>
              <th className="py-3 px-4">Assignee</th>
              <th className="py-3 px-4 cursor-pointer" onClick={() => handleSort('status')}>
                <div className="flex items-center gap-1">
                  <span>Status</span>
                  <span className="material-symbols-outlined text-[15px] opacity-70">
                    {sortField === 'status' ? (sortAsc ? 'arrow_drop_up' : 'arrow_drop_down') : 'unfold_more'}
                  </span>
                </div>
              </th>
              <th className="py-3 px-6 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {paginated.map((t) => (
              <tr key={t.id} className="hover:bg-indigo-50/40 transition-colors group">
                <td className="py-3.5 px-6 whitespace-nowrap font-mono font-bold text-indigo-700">
                  {t.code}
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <ChannelBadge channel={t.channel} />
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-slate-400 text-[16px]">domain</span>
                    <div>
                      <span className="font-semibold text-slate-800 block">{t.companyName}</span>
                      <span className="text-[11px] text-slate-400">{t.clientContact}</span>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4 max-w-sm">
                  <div className="font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                    {t.title}
                  </div>
                  <div className="text-[11px] text-slate-500 line-clamp-1">{t.description}</div>
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <PriorityBadge priority={t.priority} />
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <div className="flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-slate-400 text-[16px]">badge</span>
                    <div>
                      <span className="font-semibold text-slate-800 block leading-tight">{t.assignedToName}</span>
                      <span className="text-[10px] text-indigo-600 font-medium">{t.assignedToRole}</span>
                    </div>
                  </div>
                </td>
                <td className="py-3.5 px-4 whitespace-nowrap">
                  <StatusBadge status={t.status} />
                </td>
                <td className="py-3.5 px-6 text-right whitespace-nowrap">
                  <button
                    onClick={() => onViewTicket(t.id)}
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
        pageSizeOptions={[5, 10, 20]}
      />
    </div>
  );
};
