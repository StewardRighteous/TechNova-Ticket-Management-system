import React, { useState } from "react";
import type {
  Company,
  Employee,
  ServiceLine,
  Ticket,
  TicketStatus,
} from "../../types";
import { TicketBanner } from "./TicketBanner";
import { TicketAssignmentProgress } from "./TicketAssignmentProgress";
import { TicketDetailsPanel } from "./TicketDetailsPanel";
import { Breadcrumb } from "../common";

interface TicketDetailHeroProps {
  ticket: Ticket;
  companies: Company[];
  services: ServiceLine[];
  employees: Employee[];
  onBack: () => void;
  onStatusChange: (status: TicketStatus) => void;
  onAssigneeChange: (empId: string, note?: string) => void;
  onUpdateTicket: (updates: Partial<Ticket>) => void;
}

type DetailTab = "details" | "assignment";

export const TicketDetailHero: React.FC<TicketDetailHeroProps> = ({
  ticket,
  companies,
  services,
  employees,
  onBack,
  onStatusChange,
  onAssigneeChange,
  onUpdateTicket,
}) => {
  const [activeTab, setActiveTab] = useState<DetailTab>("details");

  return (
    <div className="space-y-2">
      <Breadcrumb section="Tickets" current={ticket.code} onBack={onBack} />
      <TicketBanner ticket={ticket} />

      <div
        className="flex gap-2 border-b border-slate-200"
        role="tablist"
        aria-label="Ticket information"
      >
        <TabButton
          active={activeTab === "details"}
          onClick={() => setActiveTab("details")}
          icon="description"
        >
          Ticket details
        </TabButton>
        <TabButton
          active={activeTab === "assignment"}
          onClick={() => setActiveTab("assignment")}
          icon="assignment"
        >
          Assignment progress
        </TabButton>
      </div>

      {activeTab === "details" ? (
        <TicketDetailsPanel
          ticket={ticket}
          companies={companies}
          services={services}
          onSave={onUpdateTicket}
        />
      ) : (
        <TicketAssignmentProgress
          onStatusChange={onStatusChange}
          ticket={ticket}
          employees={employees}
          onAssigneeChange={onAssigneeChange}
        />
      )}
    </div>
  );
};

const TabButton: React.FC<
  React.PropsWithChildren<{
    active: boolean;
    onClick: () => void;
    icon: string;
  }>
> = ({ active, onClick, icon, children }) => (
  <button
    role="tab"
    aria-selected={active}
    onClick={onClick}
    className={`inline-flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-bold ${active ? "border-indigo-600 text-indigo-700" : "border-transparent text-slate-500 hover:text-slate-800"}`}
  >
    <span className="material-symbols-outlined text-[17px]">{icon}</span>
    {children}
  </button>
);
