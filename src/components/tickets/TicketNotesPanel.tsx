import { useState } from "react";
import type { Employee, InternalNote, NoteType } from "../../types/barrel";
import { NotesSection } from "../../ui/barrel";

interface TicketNotesPanelProps {
  notes: InternalNote[];
  employees: Employee[];
  onAddNote: (body: string, type: NoteType) => void;
  onChangeNotes?: (notes: InternalNote[]) => void;
}

const noteTypes: NoteType[] = ["General", "Enquiry", "Client-provided details", "Investigation", "Handover"];

export function TicketNotesPanel({ notes, employees, onAddNote, onChangeNotes }: TicketNotesPanelProps) {
  const [body, setBody] = useState("");
  const [search, setSearch] = useState("");
  const [noteType, setNoteType] = useState<NoteType>("General");
  const [authorFilter, setAuthorFilter] = useState<string[]>([]);
  const [typeFilter, setTypeFilter] = useState<string[]>([]);
  const query = search.trim().toLowerCase();
  const rows = notes.map((note) => {
    const author = employees.find((employee) => employee.id === note.authorId);
    const date = new Date(note.createdAt);
    return { id: note.id, author: author?.name ?? note.authorId, authorId: note.authorId, avatar: author?.avatar ?? "person", body: note.body, type: note.type ?? "General", pinned: Boolean(note.pinned), time: Number.isNaN(date.getTime()) ? "N/A" : date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" }), date: Number.isNaN(date.getTime()) ? note.createdAt : date.toLocaleDateString() };
  }).filter((note) => `${note.author} ${note.body} ${note.type}`.toLowerCase().includes(query) && (!authorFilter.length || authorFilter.includes(note.authorId)) && (!typeFilter.length || typeFilter.includes(note.type))).sort((a, b) => Number(b.pinned) - Number(a.pinned));

  const post = () => {
    if (!body.trim()) return;
    onAddNote(body.trim(), noteType);
    setBody("");
  };

  return <NotesSection notes={rows} search={search} onSearchChange={setSearch} body={body} onBodyChange={setBody} noteType={noteType} noteTypeOptions={noteTypes.map((type) => ({ value: type, label: type }))} onNoteTypeChange={(value) => setNoteType(value as NoteType)} onPost={post} onTogglePin={onChangeNotes ? (id) => onChangeNotes(notes.map((note) => note.id === id ? { ...note, pinned: !note.pinned } : note)) : undefined} onEditNote={onChangeNotes ? (id, newBody, type) => onChangeNotes(notes.map((note) => note.id === id ? { ...note, body: newBody, type: type as NoteType } : note)) : undefined} onDeleteNote={onChangeNotes ? (id) => onChangeNotes(notes.filter((note) => note.id !== id)) : undefined} people={employees.filter((employee) => employee.accountStatus !== "Disabled").map((employee) => ({ id: employee.id, name: employee.name }))} authorOptions={employees.map((employee) => ({ value: employee.id, label: employee.name }))} authorFilter={authorFilter} onAuthorFilterChange={setAuthorFilter} typeFilter={typeFilter} onTypeFilterChange={setTypeFilter} />;
}
