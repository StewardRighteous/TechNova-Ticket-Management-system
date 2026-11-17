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
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h4 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
        Issue Overview
      </h4>

      <p className="rounded-xl border border-slate-100 bg-slate-50 p-4 text-xs leading-relaxed text-slate-700">
        {ticket.description}
      </p>

      {/* Dynamic diagnostic fields */}
      {diag && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          {diag.operatingSystem && (
            <DiagField icon="computer" label="OS" value={diag.operatingSystem} />
          )}
          {diag.browser && (
            <DiagField icon="language" label="Browser" value={diag.browser} />
          )}
          {diag.device && (
            <DiagField icon="devices" label="Device" value={diag.device} />
          )}
          {diag.errorCode && (
            <DiagField icon="error" label="Error Code" value={diag.errorCode} />
          )}
          {diag.errorMessage && (
            <DiagField icon="report" label="Error" value={diag.errorMessage} />
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
            {diag.stepsToReproduce}
          </p>
        </div>
      )}

      {/* Expected vs Actual */}
      {(diag?.expectedBehavior || diag?.actualBehavior) && (
        <div className="mt-3 grid grid-cols-2 gap-3">
          {diag?.expectedBehavior && (
            <div>
              <h5 className="mb-1 text-xs font-bold text-emerald-700">
                Expected
              </h5>
              <p className="rounded-lg border border-emerald-100 bg-emerald-50 p-2.5 text-xs text-slate-700">
                {diag.expectedBehavior}
              </p>
            </div>
          )}
          {diag?.actualBehavior && (
            <div>
              <h5 className="mb-1 text-xs font-bold text-rose-700">
                Actual
              </h5>
              <p className="rounded-lg border border-rose-100 bg-rose-50 p-2.5 text-xs text-slate-700">
                {diag.actualBehavior}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Tags */}
      {ticket.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {ticket.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-600"
            >
              {tag}
            </span>
          ))}
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
