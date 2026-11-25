import { useRef, useState } from "react";
import { Button } from "../atoms/Button";
import { CategoryBadge } from "../atoms/CategoryBadge";
import { Icon } from "../atoms/Icon";
import { Textarea } from "../atoms/Input";
import { StaffAvatar } from "../atoms/StaffAvatar";
import { ClearTableFiltersButton, PaginatedDataTable, TableHead, TableHeader, TableRow } from "./DataTable";
import { TableSearch } from "../molecules/TableSearch";
import { TableValue } from "../molecules/TableValue";
import { ComboboxFilter } from "../groups/ComboboxFilter";
import { SelectDropdown } from "../groups/SelectDropdown";
import { Dialog } from "./Dialog";
import { ConfirmationDialog } from "./ConfirmationDialog";
import { Label } from "../atoms/Label";

export interface NoteRow {
  id: string;
  author: string;
  avatar: string;
  body: string;
  type: string;
  pinned: boolean;
  time: string;
  date: string;
}

interface NotesSectionProps {
  notes: NoteRow[];
  search: string;
  onSearchChange: (value: string) => void;
  body: string;
  onBodyChange: (value: string) => void;
  noteType: string;
  noteTypeOptions: { value: string; label: string }[];
  onNoteTypeChange: (value: string) => void;
  onPost: () => void;
  onTogglePin?: (id: string) => void;
  people: { id: string; name: string }[];
  authorOptions: { value: string; label: string }[];
  authorFilter: string[];
  onAuthorFilterChange: (values: string[]) => void;
  typeFilter: string[];
  onTypeFilterChange: (values: string[]) => void;
  onEditNote?: (id: string, body: string, type: string) => void;
  onDeleteNote?: (id: string) => void;
}

function renderNoteBody(body: string, people: { id: string; name: string }[]) {
  const names = [...people].sort((a, b) => b.name.length - a.name.length);
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  while (cursor < body.length) {
    const at = body.indexOf("@", cursor);
    if (at < 0) break;
    const person = names.find(({ name }) => body.slice(at + 1, at + 1 + name.length).toLowerCase() === name.toLowerCase() && !/[\p{L}\p{N}_]/u.test(body[at + name.length + 1] ?? ""));
    if (!person) { parts.push(body.slice(cursor, at + 1)); cursor = at + 1; continue; }
    parts.push(body.slice(cursor, at));
    parts.push(<span key={at} className="rounded bg-teal-100 px-1 font-semibold text-teal-900">{body.slice(at, at + person.name.length + 1)}</span>);
    cursor = at + person.name.length + 1;
  }
  parts.push(body.slice(cursor));
  return parts;
}

export function NotesSection({ notes, search, onSearchChange, body, onBodyChange, noteType, noteTypeOptions, onNoteTypeChange, onPost, onTogglePin, onEditNote, onDeleteNote, people, authorOptions, authorFilter, onAuthorFilterChange, typeFilter, onTypeFilterChange }: NotesSectionProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [mention, setMention] = useState<{ start: number; end: number; query: string } | null>(null);
  const [activeMention, setActiveMention] = useState(0);
  const [editing, setEditing] = useState<{ id: string; body: string; type: string } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const suggestions = mention ? people.filter((person) => person.name.toLowerCase().includes(mention.query.toLowerCase())).slice(0, 6) : [];

  const updateMention = (value: string, cursor: number) => {
    const match = value.slice(0, cursor).match(/(?:^|\s)@([^@\n]*)$/);
    setMention(match ? { start: cursor - match[1].length - 1, end: cursor, query: match[1] } : null);
    setActiveMention(0);
  };
  const chooseMention = (name: string) => {
    if (!mention) return;
    const insertion = `@${name} `;
    onBodyChange(body.slice(0, mention.start) + insertion + body.slice(mention.end));
    const position = mention.start + insertion.length;
    setMention(null);
    requestAnimationFrame(() => { textareaRef.current?.focus(); textareaRef.current?.setSelectionRange(position, position); });
  };

  return (
    <section className="space-y-4 p-5" aria-label="Ticket notes">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <TableSearch id="notes-search" value={search} onChange={onSearchChange} placeholder="Search notes..." aria-label="Search notes" compact className="sm:max-w-xs" />
        <div className="flex flex-wrap gap-2">
          <ComboboxFilter hideClear label="Author" options={authorOptions} selectedValues={authorFilter} onChange={onAuthorFilterChange} />
          <ComboboxFilter hideClear label="Type" options={noteTypeOptions} selectedValues={typeFilter} onChange={onTypeFilterChange} />
          {(authorFilter.length > 0 || typeFilter.length > 0) && <ClearTableFiltersButton onClear={() => { onAuthorFilterChange([]); onTypeFilterChange([]); }} />}
        </div>
      </div>
      <div>
        <PaginatedDataTable rows={notes} scroll className="min-w-[600px]">
          {(pageRows) => <>
            <TableHead tone="plain" className="text-slate-500">
              <TableRow>
                <TableHeader density="compact" className="rounded-l-md"><Icon aria-hidden="true" className="align-middle text-base">push_pin</Icon><span className="sr-only">Pin</span></TableHeader>
                <TableHeader density="narrow">Author</TableHeader>
                <TableHeader density="narrow" className="w-1/2">Note</TableHeader>
                <TableHeader density="narrow">Type</TableHeader>
                <TableHeader density="narrow">Time</TableHeader>
                <TableHeader density="narrow">Date</TableHeader>
                <TableHeader density="narrow" className="rounded-r-md">Actions</TableHeader>
              </TableRow>
            </TableHead>
            <tbody>
              {pageRows.map((note) => <tr key={note.id} className="border-b border-slate-100 align-middle text-slate-700">
                <td className="px-2 py-1">{onTogglePin && <Button tone="ghost" size="icon" type="button" aria-label={`${note.pinned ? "Unpin" : "Pin"} note by ${note.author}`} aria-pressed={note.pinned} onClick={() => onTogglePin(note.id)} className={`h-8 w-8 ${note.pinned ? "text-teal-700" : ""}`}><Icon aria-hidden="true" className="text-lg">push_pin</Icon></Button>}</td>
                <td className="px-3 py-1"><div className="flex items-center gap-2 font-semibold text-slate-900"><StaffAvatar src={note.avatar} alt={`${note.author} profile`} sizeClassName="h-7 w-7" /><span>{note.author}</span></div></td>
                <td className="whitespace-pre-wrap px-3 py-1 leading-relaxed">{note.pinned && <span className="mb-1 flex items-center gap-1 font-semibold text-teal-700"><Icon aria-hidden="true" className="text-sm">push_pin</Icon>Pinned message</span>}{renderNoteBody(note.body, people)}</td>
                <td className="px-3 py-1"><CategoryBadge category={note.type} /></td>
                <td className="whitespace-nowrap px-3 py-1"><TableValue icon="schedule">{note.time}</TableValue></td>
                <td className="whitespace-nowrap px-3 py-1"><TableValue icon="calendar_today">{note.date}</TableValue></td>
                <td className="px-3 py-1"><div className="flex gap-1">{onEditNote && <Button tone="ghost" size="icon" type="button" aria-label={`Edit note by ${note.author}`} title="Edit note" onClick={() => setEditing({ id: note.id, body: note.body, type: note.type })} className="h-8 w-8 text-teal-600 hover:bg-teal-50"><Icon aria-hidden="true" className="text-lg">edit</Icon></Button>}{onDeleteNote && <Button tone="ghost" size="icon" type="button" aria-label={`Delete note by ${note.author}`} title="Delete note" onClick={() => setDeletingId(note.id)} className="h-8 w-8 text-red-600 hover:bg-red-50"><Icon aria-hidden="true" className="text-lg">delete</Icon></Button>}</div></td>
              </tr>)}
              {!notes.length && <tr><td colSpan={7} className="px-3 py-8 text-center text-slate-400">{search.trim() || authorFilter.length || typeFilter.length ? "No notes match your filters." : "No notes yet. Add the first note below."}</td></tr>}
            </tbody>
          </>}
        </PaginatedDataTable>
      </div>
      <div className="flex flex-col gap-2 rounded-lg border border-slate-200 p-2 sm:flex-row">
        <div className="relative min-w-0 flex-1">
          <Textarea ref={textareaRef} aria-label="Write a note" aria-autocomplete="list" aria-controls={mention && suggestions.length ? "note-mentions" : undefined} value={body} onChange={(event) => { onBodyChange(event.target.value); updateMention(event.target.value, event.target.selectionStart); }} onClick={(event) => updateMention(body, event.currentTarget.selectionStart)} onKeyDown={(event) => {
            if (mention && suggestions.length && event.key === "ArrowDown") { event.preventDefault(); setActiveMention((index) => (index + 1) % suggestions.length); }
            else if (mention && suggestions.length && event.key === "ArrowUp") { event.preventDefault(); setActiveMention((index) => (index + suggestions.length - 1) % suggestions.length); }
            else if (mention && suggestions.length && event.key === "Enter" && !event.ctrlKey && !event.metaKey) { event.preventDefault(); chooseMention(suggestions[activeMention].name); }
            else if (mention && event.key === "Escape") { event.preventDefault(); setMention(null); }
            else if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) { event.preventDefault(); setMention(null); onPost(); }
          }} rows={3} placeholder="Write a note for the team... Use @ to mention a teammate" className="h-full resize-y bg-slate-50" />
          {mention && <div id="note-mentions" className="absolute bottom-full left-0 z-20 mb-1 max-h-48 w-64 overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-lg" role="listbox" aria-label="Team members">{suggestions.length ? suggestions.map((person, index) => <Button key={person.id} tone="plain" type="button" role="option" aria-selected={index === activeMention} onMouseDown={(event) => event.preventDefault()} onClick={() => chooseMention(person.name)} className={`block w-full rounded px-3 py-2 text-left text-sm ${index === activeMention ? "bg-teal-50 text-teal-900" : "text-slate-700 hover:bg-slate-100"}`}>{person.name}</Button>) : <p className="px-3 py-2 text-xs text-slate-500">No team members found.</p>}</div>}
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-52 sm:shrink-0"><SelectDropdown label="Note type" value={noteType} options={noteTypeOptions} onChange={onNoteTypeChange} /><Button tone="primary" size="compact" type="button" disabled={!body.trim()} onClick={() => { setMention(null); onPost(); }} className="min-h-10 w-full">Add note</Button></div>
      </div>
      {editing && <Dialog title="Edit note" width="small" onClose={() => setEditing(null)}><div className="space-y-4 px-5 pt-4 sm:px-7"><div><Label htmlFor="edit-ticket-note" className="mb-1 block">Note</Label><Textarea id="edit-ticket-note" rows={4} value={editing.body} onChange={(event) => setEditing({ ...editing, body: event.target.value })} /></div><SelectDropdown label="Note type" showLabel value={editing.type} options={noteTypeOptions} onChange={(type) => setEditing({ ...editing, type })} /></div><footer className="flex justify-end gap-2 px-5 py-4 sm:px-7"><Button type="button" cancel onClick={() => setEditing(null)}>Cancel</Button><Button save type="button" tone="primary" disabled={!editing.body.trim()} onClick={() => { onEditNote?.(editing.id, editing.body.trim(), editing.type); setEditing(null); }}>Save</Button></footer></Dialog>}
      {deletingId && <ConfirmationDialog title="Delete note?" description="This note will be permanently removed from the ticket." confirmLabel="Delete" danger onCancel={() => setDeletingId(null)} onConfirm={() => { onDeleteNote?.(deletingId); setDeletingId(null); }} />}
    </section>
  );
}
