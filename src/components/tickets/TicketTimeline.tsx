import React from 'react';
import type { TicketTimelineItem } from '../../types';

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
  onAddNote
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <span className="material-symbols-outlined text-[18px] text-indigo-600">history</span>
          <span>Incident Activity & Audit Trail</span>
        </h3>
        <span className="text-xs font-semibold text-slate-400 font-mono">{timeline.length} Events</span>
      </div>

      {/* Timeline items list */}
      <div className="space-y-4 mb-6">
        {timeline.map((item, idx) => (
          <div key={item.id || idx} className="relative pl-6 pb-2 border-l-2 border-indigo-100 last:border-transparent">
            <div className="absolute -left-[7px] top-0 w-3 h-3 rounded-full bg-indigo-600 border-2 border-white ring-2 ring-indigo-100"></div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-800">{item.author}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium">
                  {item.role}
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">{item.timestamp}</span>
            </div>
            <div className="text-xs font-semibold text-indigo-700 mt-0.5">{item.action}</div>
            <p className="text-xs text-slate-600 mt-1 bg-slate-50 p-2.5 rounded-lg border border-slate-100 leading-relaxed">
              {item.note}
            </p>
          </div>
        ))}
      </div>

      {/* Quick Add Note */}
      <div className="pt-4 border-t border-slate-100">
        <label className="block text-xs font-bold text-slate-700 mb-1.5">
          Add Operational Note / Status Update
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') onAddNote();
            }}
            placeholder="Document remediation steps, testing results, or client communications..."
            className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={onAddNote}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors shadow-sm"
          >
            <span className="material-symbols-outlined text-[16px]">send</span>
            <span>Post</span>
          </button>
        </div>
      </div>
    </div>
  );
};
