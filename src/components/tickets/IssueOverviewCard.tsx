import React from "react";
import type { Ticket } from "../../types/barrel";

interface IssueOverviewCardProps {
  ticket: Ticket;
}

export const IssueOverviewCard: React.FC<IssueOverviewCardProps> = ({
  ticket,
}) => {
  const diag = ticket.diagnosticData;

  return (
    <div className="p-5">
      <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
        Issue Overview
      </h4>

      <p className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs leading-relaxed text-slate-700">
        {ticket.description.replace(/\\n/g, "\n")}
      </p>

      {/* Diagnostic fields collected by the add-ticket form */}
      {diag && (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {diag.errorMessage && (
            <DiagField icon="report" label="Error message" value={diag.errorMessage} />
          )}
          {diag.errorCode && (
            <DiagField icon="error" label="Error code" value={diag.errorCode} />
          )}
          {diag.clusterNode && (
            <DiagField icon="dns" label="Cluster / server node" value={diag.clusterNode} />
          )}
          {diag.affectedUsers !== undefined && (
            <DiagField icon="group" label="Affected users" value={String(diag.affectedUsers)} />
          )}
          {diag.expectedBehavior && (
            <DiagField icon="target" label="Expected behavior" value={diag.expectedBehavior} />
          )}
          {diag.actualBehavior && (
            <DiagField icon="report_problem" label="Actual behavior" value={diag.actualBehavior} />
          )}
        </div>
      )}

      {/* Steps to reproduce */}
      {diag?.stepsToReproduce && (
        <div className="mt-4">
          <h5 className="mb-1.5 text-xs font-bold text-slate-600">
            Steps to Reproduce
          </h5>
          <p className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs leading-relaxed text-slate-600 whitespace-pre-line">
            {diag.stepsToReproduce.replace(/\\n/g, "\n")}
          </p>
        </div>
      )}

    </div>
  );
};

const DiagField: React.FC<{
  icon: string;
  label: string;
  value: string;
}> = ({ icon, label, value }) => (
  <div className="flex items-start gap-2 rounded-lg border border-slate-100 bg-slate-50 p-2.5">
    <span className="material-symbols-outlined mt-0.5 text-[14px] text-slate-400">
      {icon}
    </span>
    <div>
      <p className="text-[10px] font-medium text-slate-400">{label}</p>
      <p className="text-xs font-semibold text-slate-700">{value}</p>
    </div>
  </div>
);
