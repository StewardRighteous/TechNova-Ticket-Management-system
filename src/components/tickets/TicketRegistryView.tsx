import React, { useState } from 'react';
import { useTicketStore } from '../../store';
import { TicketTable } from './TicketTable';
import { TicketDetailHero } from './TicketDetailHero';
import { filterTicketsByRole } from '../../utils';

export const TicketRegistryView: React.FC = () => {
  const {
    data,
    activeRole,
    currentUser,
    setSelectedTicketId,
    updateTicketStatus,
    updateTicket,
    assignTicket,
    setIsCreateModalOpen
  } = useTicketStore();

  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);

  // Role-specific filtered tickets
  const roleTickets = filterTicketsByRole(data.tickets, activeRole, currentUser?.id);
  const selectedTicket = roleTickets.find((t) => t.id === activeTicketId) || data.tickets.find((t) => t.id === activeTicketId);

  return (
    <div className="p-6 md:p-8 space-y-6">
      {selectedTicket ? (
        <TicketDetailHero
          ticket={selectedTicket}
          companies={data.companies}
          services={data.services}
          employees={data.employees}
          onBack={() => setActiveTicketId(null)}
          onStatusChange={(status) => updateTicketStatus(selectedTicket.id, status)}
          onAssigneeChange={(empId, note) => assignTicket(selectedTicket.id, empId, note)}
          onUpdateTicket={(updates) => updateTicket(selectedTicket.id, updates)}
        />
      ) : (
        <TicketTable
          tickets={roleTickets}
          onViewTicket={(id) => {
            setActiveTicketId(id);
            setSelectedTicketId(id);
          }}
          onCreateNew={() => setIsCreateModalOpen(true)}
        />
      )}
    </div>
  );
};
