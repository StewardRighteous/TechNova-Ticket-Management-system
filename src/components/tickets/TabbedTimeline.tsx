import React, { useState } from "react";
import type { Employee, TicketTimelineItem, InternalNote } from "../../types/barrel";

type TimelineTab = "communications" | "activity" | "internal";

interface TabbedTimelineProps {
  timeline: TicketTimelineItem[];
  internalNotes: InternalNote[];
  onAddInternalNote: (body: string) => void;
  employees?: Employee[];
}

export const TabbedTimeline: React.FC<TabbedTimelineProps> = ({
  timeline,
  internalNotes,
  onAddInternalNote,
  employees = [],
}) => {
  const [activeTab, setActiveTab] = useState<TimelineTab>("communications");
  const customerEvents = timeline.filter((item) => item.kind !== "workflow");
  const workflowEvents = timeline.filter((item) => item.kind === "workflow");
  const [noteBody, setNoteBody] = useState("");
  const [posted, setPosted] = useState(false);

  const handlePostNote = () => {
    if (!noteBody.trim()) return;
    onAddInternalNote(noteBody.trim());
    setNoteBody("");
    setPosted(true);
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Tab bar */}
      <div className="flex border-b border-slate-100" role="tablist" aria-label="Activity timeline tabs">
        <TabTrigger
          active={activeTab === "communications"}
          onClick={() => setActiveTab("communications")}
          icon="forum"
          label="Customer Messages"
          count={customerEvents.length}
          id="activity-tab-communications"
          controls="activity-panel-communications"
        />
        <TabTrigger active={activeTab === "activity"} onClick={() => setActiveTab("activity")} icon="history" label="Workflow Activity" count={workflowEvents.length} id="activity-tab-workflow" controls="activity-panel-workflow" />
        <TabTrigger
          active={activeTab === "internal"}
          onClick={() => setActiveTab("internal")}
          icon="lock"
          label="Internal Notes"
          count={internalNotes.length}
          id="activity-tab-internal"
          controls="activity-panel-internal"
        />
      </div>

      {/* Panel */}
      <div className="p-5" role="tabpanel" id={`activity-panel-${activeTab}`} aria-labelledby={`activity-tab-${activeTab}`}>
        {activeTab === "communications" ? <CommunicationsPanel timeline={customerEvents} /> : activeTab === "activity" ? <CommunicationsPanel timeline={workflowEvents} /> : (
          <InternalNotesPanel
            notes={internalNotes}
            employees={employees}
            noteBody={noteBody}
            setNoteBody={setNoteBody}
            onPost={handlePostNote}
            posted={posted}
          />
        )}
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Tab trigger                                                         */
/* ------------------------------------------------------------------ */

const TabTrigger: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
  count: number;
  id: string;
  controls: string;
}> = ({ active, onClick, icon, label, count, id, controls }) => (
  <button
    role="tab"
    id={id}
    aria-controls={controls}
    aria-selected={active}
    tabIndex={active ? 0 : -1}
    onKeyDown={(event) => { if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) { event.preventDefault(); const target = event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>("[role=tab]"); if (!target?.length) return; const index = event.key === "Home" ? 0 : event.key === "End" ? target.length - 1 : event.key === "ArrowRight" ? (active ? 1 : 0) : (active ? target.length - 1 : 0); target[index]?.click(); target[index]?.focus(); } }}
    onClick={onClick}
    className={`inline-flex flex-1 items-center justify-center gap-2 border-b-2 px-4 py-3.5 text-xs font-bold transition-colors ${
      active
        ? "border-indigo-600 text-indigo-700"
        : "border-transparent text-slate-400 hover:text-slate-700"
    }`}
  >
    <span className="material-symbols-outlined text-[16px]">{icon}</span>
    <span>{label}</span>
    <span
      className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
        active
          ? "bg-indigo-100 text-indigo-700"
          : "bg-slate-100 text-slate-500"
      }`}
    >
      {count}
    </span>
  </button>
);

/* ------------------------------------------------------------------ */
/* Communications (email history / timeline)                           */
/* ------------------------------------------------------------------ */

const CommunicationsPanel: React.FC<{
  timeline: TicketTimelineItem[];
}> = ({ timeline }) => {
  if (timeline.length === 0) {
    return (
      <p className="rounded-xl bg-slate-50 p-6 text-center text-xs text-slate-400">
        No communications recorded yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {timeline.map((item, idx) => (
        <div
          key={item.id || idx}
          className="relative border-l-2 border-indigo-100 pb-2 pl-6 first:border-transparent"
        >
          <div className="absolute -left-1.75 top-0 h-3 w-3 rounded-full border-2 border-white bg-indigo-600 ring-2 ring-indigo-100" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-800">
                {item.author}
              </span>
              <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">
                {item.role}
              </span>
            </div>
            <span className="font-mono text-[11px] text-slate-400">
            {new Date(item.timestamp).toString() !== "Invalid Date" ? new Date(item.timestamp).toLocaleString() : item.timestamp}
            </span>
          </div>
          {item.action.toLowerCase().includes("opened") && (
            <div className="mt-0.5 text-xs font-semibold text-indigo-500">
              {item.action}
            </div>
          )}
          {item.action.toLowerCase().includes("escalated") && (
            <div className="mt-0.5 text-xs font-semibold text-rose-500">
              {item.action}
            </div>
          )}
          {item.action.toLowerCase().includes("qa") && (
            <div className="mt-0.5 text-xs font-semibold text-purple-500">
              {item.action}
            </div>
          )}
          {item.action.toLowerCase().includes("resolved") && (
            <div className="mt-0.5 text-xs font-semibold text-emerald-500">
              {item.action}
            </div>
          )}
          <p className="mt-1 rounded-lg border border-slate-100 bg-slate-50 p-2.5 text-xs leading-relaxed text-slate-600">
            {item.note}
          </p>
        </div>
      ))}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* Internal notes (staff-only)                                         */
/* ------------------------------------------------------------------ */

const InternalNotesPanel: React.FC<{
  notes: InternalNote[];
  employees: Employee[];
  noteBody: string;
  setNoteBody: (v: string) => void;
  onPost: () => void;
  posted: boolean;
}> = ({ notes, employees, noteBody, setNoteBody, onPost, posted }) => (
  <div className="space-y-5">
    {notes.length === 0 ? (
      <p className="rounded-xl bg-slate-50 p-6 text-center text-xs text-slate-400">
        No internal notes yet. Add one below.
      </p>
    ) : (
      <div className="space-y-3">
        {notes.map((n) => (
          <div
            key={n.id}
            className="rounded-xl border border-amber-100 bg-amber-50/50 p-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">
                {employees.find((employee) => employee.id === n.authorId)?.name ?? n.authorId}
              </span>
              <span className="font-mono text-[10px] text-slate-400">
                {new Date(n.createdAt).toLocaleString()}
              </span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-slate-700">
              {n.body}
            </p>
          </div>
        ))}
      </div>
    )}

    {/* Composer */}
    <div className="border-t border-slate-100 pt-4">
      <label className="mb-1.5 block text-xs font-bold text-slate-700">
        <span className="material-symbols-outlined mr-1 align-middle text-[14px] text-amber-500">
          lock
        </span>
        Staff-only internal note
      </label>
      <div className="flex gap-2">
        <textarea
          value={noteBody}
          onChange={(e) => setNoteBody(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) onPost();
          }}
          placeholder="Write an internal note visible only to staff..."
          rows={2}
          className="flex-1 resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500"
        />
        <button
          type="button"
          onClick={onPost}
          className="flex h-fit items-center gap-1 self-end rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700"
        >
          <span className="material-symbols-outlined text-[16px]">send</span>
          <span>Post</span>
        </button>
      </div>
      <p className="mt-1 text-[10px] text-slate-400">
        Press Ctrl+Enter to post
      </p>
      {posted && <p role="status" className="mt-2 text-xs font-medium text-emerald-700">Internal note posted.</p>}
    </div>
  </div>
);
