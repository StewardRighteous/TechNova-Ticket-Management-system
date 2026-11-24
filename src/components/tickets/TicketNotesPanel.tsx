import { Button, Heading, Label, Textarea } from "../../ui/barrel";
import React, { useState } from "react";
import type { Employee, InternalNote } from "../../types/barrel";
import { StaffAvatar } from "../../ui/atoms/StaffAvatar";

interface TicketNotesPanelProps {
  notes: InternalNote[];
  employees: Employee[];
  onAddNote: (body: string) => void;
}

export const TicketNotesPanel: React.FC<TicketNotesPanelProps> = ({ notes, employees, onAddNote }) => {
  const [body, setBody] = useState("");
  const post = () => {
    if (!body.trim()) return;
    onAddNote(body.trim());
    setBody("");
  };

  return <section className="grid gap-6 p-5 md:grid-cols-[minmax(0,1fr)_minmax(280px,0.8fr)]" aria-labelledby="ticket-notes-heading">
    <div className="min-w-0">
      <div className="mb-4"><Heading as="h3" variant="subsection" id="ticket-notes-heading">Notes &amp; communication</Heading><p className="mt-1 text-xs text-slate-500">Add a note for the team to keep the conversation moving.</p></div>
      {notes.length ? <div className="space-y-3">{notes.map((note) => {
        const author = employees.find((employee) => employee.id === note.authorId);

        return <article key={note.id} className="rounded-xl border border-amber-100 bg-amber-50/50 p-3"><div className="flex items-start gap-3"><StaffAvatar src={author?.avatar ?? "person"} alt={`${author?.name ?? note.authorId} profile`} sizeClassName="h-8 w-8" fallbackClassName="text-[17px]" /><div className="min-w-0 flex-1"><div className="flex items-center justify-between gap-3"><span className="text-xs font-bold text-slate-800">{author?.name ?? note.authorId}</span><time className="shrink-0 text-[10px] text-slate-400">{formatTimestamp(note.createdAt)}</time></div><p className="mt-1 text-xs leading-relaxed text-slate-700">{note.body}</p></div></div></article>;
      })}</div> : <p className="rounded-xl bg-slate-50 p-6 text-center text-xs text-slate-400">No notes yet. Add the first communication using the form.</p>}
    </div>
    <div className="self-start rounded-xl border border-slate-100 bg-white p-4 shadow-sm md:sticky md:top-4"><Label variant="plain" htmlFor="ticket-note" className="mb-1.5 block text-xs font-bold text-slate-700">Add note</Label><div className="flex flex-col gap-2"><Textarea appearance="plain" id="ticket-note" value={body} onChange={(event) => setBody(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) post(); }} rows={6} placeholder="Write a note for the team..." className="min-w-0 w-full resize-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs outline-none focus:bg-white focus:ring-2 focus:ring-indigo-500" /><Button tone="plain" type="button" onClick={post} className="self-end rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700">Add note</Button></div><p className="mt-1 text-[10px] text-slate-400">Press Ctrl+Enter to add the note.</p></div>
  </section>;
};

function formatTimestamp(timestamp: string): string { const date = new Date(timestamp); return Number.isNaN(date.getTime()) ? timestamp : date.toLocaleString(); }
