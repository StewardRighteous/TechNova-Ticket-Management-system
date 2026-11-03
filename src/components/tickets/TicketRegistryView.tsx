import React, { useState } from 'react';
import { useTicketStore } from '../../store';
import { TicketTable } from './TicketTable';
import { TicketDetailHero } from './TicketDetailHero';
import { filterTicketsByRole } from '../../utils';
import type { Ticket } from '../../types';

export const TicketRegistryView: React.FC = () => {
  const {
    data,
    activeRole,
    currentUser,
    setSelectedTicketId,
    updateTicketStatus,
    assignTicket,
    setIsCreateModalOpen
  } = useTicketStore();

  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);

  // Role-specific filtered tickets
  const roleTickets = filterTicketsByRole(data.tickets, activeRole, currentUser?.id);
  const selectedTicket = roleTickets.find((t) => t.id === activeTicketId) || data.tickets.find((t) => t.id === activeTicketId);

  const handleUpdateTicketFields = (updates: Partial<Ticket>) => {
    if (!activeTicketId) return;
    const updated = data.tickets.map((t) => {
      if (t.id === activeTicketId) {
        return { ...t, ...updates };
      }
      return t;
    });
    useTicketStore.setState({
      data: { ...data, tickets: updated }
    });
  };

  return (
    <div className="p-6 md:p-8 space-y-6">
      {selectedTicket ? (
        <TicketDetailHero
          ticket={selectedTicket}
          employees={data.employees}
          onBack={() => setActiveTicketId(null)}
          onStatusChange={(status) => updateTicketStatus(selectedTicket.id, status)}
          onAssigneeChange={(empId) => assignTicket(selectedTicket.id, empId)}
          onUpdateTicketFields={handleUpdateTicketFields}
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
