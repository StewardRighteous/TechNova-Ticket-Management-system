import React from 'react';
import { useTicketStore } from '../../store';
import { DashboardHero } from './DashboardHero';
import { DashboardStatsRow } from './DashboardStatsRow';
import { DashboardTicketTable } from './DashboardTicketTable';

export const DashboardView: React.FC = () => {
  const { data, setSelectedTicketId, setActiveTab, setIsCreateModalOpen } = useTicketStore();

  const handleSelectTicket = (id: string) => {
    setSelectedTicketId(id);
    setActiveTab('tickets');
  };

  const p1Count = data.tickets.filter((t) => t.priority.includes('P1')).length;
  const p2Count = data.tickets.filter((t) => t.priority.includes('P2')).length;
  const p3Count = data.tickets.filter((t) => t.priority.includes('P3')).length;

  const whatsappCount = data.tickets.filter((t) => t.channel === 'whatsapp').length;
  const emailCount = data.tickets.filter((t) => t.channel === 'email').length;
  const phoneCount = data.tickets.filter((t) => t.channel === 'phone').length;

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Hero Banner: Matches other tabs' header format */}
      <DashboardHero
        companyInfo={data.companyInfo}
        onExploreTickets={() => setActiveTab('tickets')}
        onNewTicket={() => setIsCreateModalOpen(true)}
      />

      {/* Structured Stats Grid with refined shadows */}
      <DashboardStatsRow
        p1Count={p1Count}
        p2Count={p2Count}
        p3Count={p3Count}
        whatsappCount={whatsappCount}
        emailCount={emailCount}
        phoneCount={phoneCount}
        totalTickets={data.tickets.length}
      />

      {/* Minimized & Compact Table matching the standard table format */}
      <DashboardTicketTable
        tickets={data.tickets}
        onSelectTicket={handleSelectTicket}
        onExploreAll={() => setActiveTab('tickets')}
      />
    </div>
  );
};
