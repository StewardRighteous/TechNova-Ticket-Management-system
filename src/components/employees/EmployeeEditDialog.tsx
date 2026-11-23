import { useRef, useState, type FormEvent } from "react";
import type { Employee, Team } from "../../types/barrel";
import { formControlClassName, SelectDropdown } from "../common/barrel";
import { DetailEditDialog } from "../common/DetailEditDialog";

export function EmployeeEditDialog({ employee, teams, canManageEmployment, onCancel, onSave }: {
  employee: Employee;
  teams: Team[];
  canManageEmployment: boolean;
  onCancel: () => void;
  onSave: (updates: Partial<Employee>) => void;
}) {
  const [draft, setDraft] = useState({ ...employee, status: employee.status === "Off Shift" ? "Off Shift" as const : "Available" as const });
  const [error, setError] = useState("");
  const [photoName, setPhotoName] = useState("");
  const photoInputRef = useRef<HTMLInputElement>(null);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = draft.name.trim();
    const roleTitle = draft.roleTitle.trim();
    if (!name || !draft.email.trim() || (canManageEmployment && !roleTitle)) { setError("Complete all required fields."); return; }
    onSave({
      name, email: draft.email.trim(), phone: draft.phone.trim(), avatar: draft.avatar, status: draft.status,
      ...(canManageEmployment ? { roleTitle, teamId: draft.teamId } : {}),
    });
  };
  return <DetailEditDialog title={canManageEmployment ? "Edit employee banner" : "Edit profile details"} onCancel={onCancel} onSave={submit}>
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="text-xs">Full name<input className={formControlClassName} required value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} /></label>
      {canManageEmployment && <label className="text-xs">Job title<input className={formControlClassName} required value={draft.roleTitle} onChange={(event) => setDraft({ ...draft, roleTitle: event.target.value })} /></label>}
      <label className="text-xs">Work email<input className={formControlClassName} required type="email" value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} /></label>
      <label className="text-xs">Work phone<input className={formControlClassName} type="tel" value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} /></label>
      <SelectDropdown label="Availability" options={["Available", "Off Shift"].map((value) => ({ value, label: value }))} value={draft.status} onChange={(value) => setDraft({ ...draft, status: value as "Available" | "Off Shift" })} />
      {canManageEmployment && <SelectDropdown label="Team" options={teams.map((team) => ({ value: team.id, label: team.name }))} value={draft.teamId ?? ""} onChange={(teamId) => setDraft({ ...draft, teamId })} placeholder="Select a team" />}
      <div className="text-xs sm:col-span-2"><span className="font-semibold text-slate-700">Profile photo</span><input ref={photoInputRef} className="sr-only" type="file" accept="image/*" aria-label="Upload profile photo" onChange={(event) => {
        const file = event.target.files?.[0];
        if (!file?.type.startsWith("image/")) return;
        setPhotoName(file.name);
        const reader = new FileReader();
        reader.onload = () => setDraft((current) => ({ ...current, avatar: String(reader.result) }));
        reader.readAsDataURL(file);
      }} /><div className="mt-1.5 flex flex-wrap items-center gap-3"><button type="button" onClick={() => photoInputRef.current?.click()} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"><span className="material-symbols-outlined text-[18px]" aria-hidden="true">upload</span>Upload profile photo</button>{photoName && <span className="truncate text-xs text-slate-500">{photoName}</span>}</div></div>
    </div>
    {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
  </DetailEditDialog>;
}
