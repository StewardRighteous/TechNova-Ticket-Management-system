import { useRef, useState, type FormEvent } from "react";
import type { Department, Employee, ServiceLine } from "../../types/barrel";
import { formControlClassName, SelectDropdown } from "../common/barrel";
import { DetailEditDialog } from "../common/DetailEditDialog";

export function ServiceEditDialog({ service, services, departments, employees, onCancel, onSave }: {
  service: ServiceLine;
  services: ServiceLine[];
  departments: Department[];
  employees: Employee[];
  onCancel: () => void;
  onSave: (updates: Partial<ServiceLine>) => void;
}) {
  const [draft, setDraft] = useState(service);
  const [error, setError] = useState("");
  const logoInputRef = useRef<HTMLInputElement>(null);
  const choices = (values: string[]) => [...new Set(values.filter(Boolean))].map((value) => ({ value, label: value }));
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const name = draft.name.trim();
    const code = draft.code.trim().toUpperCase();
    const validation = !name || !code ? "Enter a service name and code."
      : services.some((item) => item.id !== service.id && (item.code.toLowerCase() === code.toLowerCase() || item.name.toLowerCase() === name.toLowerCase())) ? "A service with this name or code already exists."
      : "";
    if (validation) { setError(validation); return; }
    const { id, activeTickets, ...editable } = draft;
    void id;
    void activeTickets;
    onSave({
      ...editable, name, code,
    });
  };
  return (
    <DetailEditDialog title="Edit service details" onCancel={onCancel} onSave={submit}>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="text-xs sm:col-span-2"><span className="font-semibold text-slate-700">Service logo</span><input ref={logoInputRef} className="sr-only" type="file" accept="image/*" aria-label="Upload service logo" onChange={(event) => { const file = event.target.files?.[0]; if (!file?.type.startsWith("image/")) return; const reader = new FileReader(); reader.onload = () => setDraft((current) => ({ ...current, logo: String(reader.result) })); reader.readAsDataURL(file); }} /><div className="mt-1.5 flex items-center gap-3"><span className="flex size-12 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50">{draft.logo ? <img src={draft.logo} alt="Service logo preview" className="h-full w-full object-cover" /> : <span className="material-symbols-outlined text-xl text-slate-500">{service.code.startsWith("CLOUD") ? "cloud" : service.code.startsWith("BIZ") ? "business" : service.code.startsWith("SUPP") ? "support_agent" : service.code.startsWith("SEC") ? "security" : "web"}</span>}</span><button type="button" onClick={() => logoInputRef.current?.click()} className="inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"><span className="material-symbols-outlined text-[18px]" aria-hidden="true">upload</span>Upload logo</button><span className="text-xs text-slate-500">PNG, JPG, or SVG</span></div></div>
        {([["name", "Service name"], ["code", "Service code"]] as const).map(([key, label]) => <label key={key} className="text-xs">{label}<input required className={formControlClassName} value={draft[key]} onChange={(event) => setDraft({ ...draft, [key]: event.target.value })} /></label>)}
        <label className="space-y-1.5 text-xs"><span className="block">Owning department</span><SelectDropdown label="Owning department" options={choices([draft.department, ...departments.map((item) => item.name)])} value={draft.department} onChange={(department) => setDraft({ ...draft, department })} /></label>
        <label className="space-y-1.5 text-xs"><span className="block">Service lead</span><SelectDropdown label="Service lead" options={choices([draft.lead, ...employees.map((item) => item.name)])} value={draft.lead} onChange={(lead) => setDraft({ ...draft, lead })} /></label>
      </div>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
    </DetailEditDialog>
  );
}
