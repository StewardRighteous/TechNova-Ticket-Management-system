import React, { useState } from 'react';
import { useTicketStore } from '../../store';
import { TicketListItem } from './TicketListItem';
import { TicketDetailView } from './TicketDetailView';
import type { InboundChannel } from '../../types';

export const TicketRegistryView: React.FC = () => {
  const {
    data,
    selectedTicketId,
    setSelectedTicketId,
    searchQuery,
    updateTicketStatus,
    assignTicket,
    addTicketTimelineNote,
    setIsCreateModalOpen
  } = useTicketStore();

  const [channelFilter, setChannelFilter] = useState<'all' | InboundChannel>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const filteredTickets = data.tickets.filter((t) => {
    if (channelFilter !== 'all' && t.channel !== channelFilter) return false;
    if (priorityFilter !== 'all' && !t.priority.includes(priorityFilter)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchCode = t.code.toLowerCase().includes(q);
      const matchComp = t.companyName.toLowerCase().includes(q);
      if (!matchTitle && !matchCode && !matchComp) return false;
    }
    return true;
  });

  const activeTicket = data.tickets.find((t) => t.id === selectedTicketId) || filteredTickets[0] || data.tickets[0];

  return (
    <div className="p-8">
      {/* Header controls & Filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Master Ticket Registry</h1>
          <p className="text-xs text-slate-500">Live omnichannel support feed across all client services</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {/* Channel selector */}
          <div className="flex items-center bg-white border border-slate-200 rounded-lg p-1 text-xs">
            <button
              onClick={() => setChannelFilter('all')}
              className={`px-2.5 py-1 rounded font-semibold ${channelFilter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-600'}`}
            >
              All ({data.tickets.length})
            </button>
            <button
              onClick={() => setChannelFilter('whatsapp')}
              className={`px-2.5 py-1 rounded font-semibold flex items-center gap-1 ${channelFilter === 'whatsapp' ? 'bg-emerald-600 text-white' : 'text-slate-600'}`}
            >
              <span className="material-symbols-outlined text-[14px]">chat</span> WhatsApp
            </button>
            <button
              onClick={() => setChannelFilter('email')}
              className={`px-2.5 py-1 rounded font-semibold flex items-center gap-1 ${channelFilter === 'email' ? 'bg-blue-600 text-white' : 'text-slate-600'}`}
            >
              <span className="material-symbols-outlined text-[14px]">mail</span> Email
            </button>
            <button
              onClick={() => setChannelFilter('phone')}
              className={`px-2.5 py-1 rounded font-semibold flex items-center gap-1 ${channelFilter === 'phone' ? 'bg-purple-600 text-white' : 'text-slate-600'}`}
            >
              <span className="material-symbols-outlined text-[14px]">call</span> Phone
            </button>
          </div>

          {/* Priority filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-1.5 text-xs bg-white border border-slate-200 rounded-lg font-medium text-slate-700 outline-none"
          >
            <option value="all">All Severities</option>
            <option value="P1">P1 Urgent Only</option>
            <option value="P2">P2 Normal Only</option>
            <option value="P3">P3 Low Only</option>
          </select>

          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-sm hover:bg-slate-800"
          >
            <span className="material-symbols-outlined text-[16px]">add</span> New Ticket
          </button>
        </div>
      </div>

      {/* Two Column Workspace Layout: Master List & Selected Detail */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column: Tickets Queue */}
        <div className="xl:col-span-4 space-y-3">
          <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-medium">
            <span>Showing {filteredTickets.length} incidents</span>
            <span>Sorted by SLA urgency</span>
          </div>

          <div className="space-y-2.5 max-h-[calc(100vh-220px)] overflow-y-auto pr-1">
            {filteredTickets.map((t) => (
              <TicketListItem
                key={t.id}
                ticket={t}
                isSelected={t.id === activeTicket?.id}
                onSelect={() => setSelectedTicketId(t.id)}
              />
            ))}
          </div>
        </div>

        {/* Right Column: Ticket Inspection & Timeline */}
        <div className="xl:col-span-8">
          {activeTicket ? (
            <TicketDetailView
              ticket={activeTicket}
              employees={data.employees}
              onStatusChange={(status) => updateTicketStatus(activeTicket.id, status)}
              onAssigneeChange={(empId) => assignTicket(activeTicket.id, empId)}
              onAddTimelineNote={(note) => addTicketTimelineNote(activeTicket.id, note)}
            />
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
              <span className="material-symbols-outlined text-[48px] mb-2 text-slate-300">confirmation_number</span>
              <p className="text-sm font-semibold">No tickets match the selected filter criteria</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
