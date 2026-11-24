import { KpiCard } from "../../ui/barrel";
import React from "react";

export interface ExecutiveKpiRibbonProps {
  totalActive: number;
  overdueCount: number;
  slaAtRiskOrBreachedCount: number;
  formattedAvgResolutionTime: string;
  onActiveClick?: () => void;
  onOverdueClick?: () => void;
  onSlaRiskClick?: () => void;
  onResolvedClick?: () => void;
}

export const ExecutiveKpiRibbon: React.FC<ExecutiveKpiRibbonProps> = ({
  totalActive,
  overdueCount,
  slaAtRiskOrBreachedCount,
  formattedAvgResolutionTime,
  onActiveClick,
  onOverdueClick,
  onSlaRiskClick,
  onResolvedClick,
}) => {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      <KpiCard label="Active Tickets" value={totalActive} icon="confirmation_number" description="Tickets currently open and being worked on." tone="indigo" onClick={onActiveClick} />
      <KpiCard label="Overdue" value={overdueCount} icon="schedule" description="Tickets past their due date." tone="amber" onClick={onOverdueClick} />
      <KpiCard label="SLA at risk" value={slaAtRiskOrBreachedCount} icon="warning" description="Tickets approaching or past their SLA deadline." tone="rose" onClick={onSlaRiskClick} data-testid="sla-risk-kpi" aria-label="View high-attention and critical incidents" />
      <KpiCard label="Avg Resolution" value={formattedAvgResolutionTime} icon="timelapse" description="Average time taken to resolve a ticket." tone="emerald" onClick={onResolvedClick} />
    </div>
  );
};
