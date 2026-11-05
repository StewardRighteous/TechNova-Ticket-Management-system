import React from "react";
import type { TicketTimelineItem } from "../../types";

interface TicketTimelineProps {
  timeline: TicketTimelineItem[];
  newNote: string;
  setNewNote: (val: string) => void;
  onAddNote: () => void;
}

export const TicketTimeline: React.FC<TicketTimelineProps> = ({
  timeline,
  newNote,
  setNewNote,
  onAddNote,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between border-b border-slate-100 pb-3">
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <span className="material-symbols-outlined text-[18px] text-indigo-600">
            history
          </span>
          <span>Incident Activity & Audit Trail</span>
        </h3>
        <span className="font-mono text-xs font-semibold text-slate-400">
          {timeline.length} Events
        </span>
      </div>

      {/* Timeline items list */}
      <div className="mb-6 space-y-4">
        {timeline.map((item, idx) => (
          <div
            key={item.id || idx}
            className="relative border-l-2 border-indigo-100 pb-2 pl-6 last:border-transparent"
          >
            <div className="absolute top-0 -left-1.75 h-3 w-3 rounded-full border-2 border-white bg-indigo-600 ring-2 ring-indigo-100"></div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800">
                  {item.author}
                </span>
                <span className="py-0.2 rounded bg-slate-100 px-1.5 text-[10px] font-medium text-slate-600">
                  {item.role}
                </span>
              </div>
              <span className="font-mono text-[11px] text-slate-400">
                {item.timestamp}
              </span>
            </div>
            <div className="mt-0.5 text-xs font-semibold text-indigo-700">
              {item.action}
            </div>
            <p className="mt-1 rounded-lg border border-slate-100 bg-slate-50 p-2.5 text-xs leading-relaxed text-slate-600">
              {item.note}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Add Note */}
      <div className="border-t border-slate-100 pt-4">
        <label className="mb-1.5 block text-xs font-bold text-slate-700">
          Add Operational Note / Status Update
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") onAddNote();
            }}
            placeholder="Document remediation steps, testing results, or client communications..."
            className="flex-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={onAddNote}
            className="flex items-center gap-1 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
          >
            <span className="material-symbols-outlined text-[16px]">send</span>
            <span>Post</span>
          </button>
        </div>
      </div>
    </div>
  );
};
