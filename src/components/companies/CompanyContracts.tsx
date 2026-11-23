import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import type { Company, ServiceLine, SupportContract } from "../../types/barrel";
import { matchesService } from "../../utils/matchesService";
import { contractStatus, durationMinutes, isContractActive, policyError } from "../../utils/supportPolicy";
import { SelectDropdown, formControlClassName } from "../common/barrel";
import { DetailEditDialog } from "../common/DetailEditDialog";
import { SlaPolicyFields } from "../common/SlaPolicyFields";

export function CompanyContracts({ company, services, canEdit, onUpdate, getServiceHref }: {
  company: Company;
  services: ServiceLine[];
  canEdit: boolean;
  onUpdate: (updates: Partial<Company>) => void;
  getServiceHref?: (service: ServiceLine) => string | undefined;
}) {
  const [draft, setDraft] = useState<SupportContract | null>(null);
  const [subscriptions, setSubscriptions] = useState<string[] | null>(null);
  const [fallback, setFallback] = useState<string | null>(null);
  const [error, setError] = useState("");
  const contracts = company.contracts ?? [];
  const serviceOptions = services.map((service) => ({ value: service.id, label: service.name }));
  const activeCount = contracts.filter((contract) => isContractActive(contract)).length;
  const editContract = (contract?: SupportContract) => {
    setError("");
    setDraft(contract ?? { id: crypto.randomUUID(), reference: "", serviceIds: [], status: "Active" });
  };
  const saveContract = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!draft) return;
    const reference = draft.reference.trim();
    const validation = !reference ? "Enter a contract reference."
      : !draft.serviceIds.length ? "Select at least one covered service."
      : draft.startsOn && draft.endsOn && draft.startsOn > draft.endsOn ? "The expiry date must follow the start date."
      : contracts.some((contract) => contract.id !== draft.id && contract.reference.toLowerCase() === reference.toLowerCase()) ? "This contract reference is already in use."
      : policyError(draft.slaPolicy);
    if (validation) { setError(validation); return; }
    const saved = { ...draft, reference };
    const next = contracts.some((contract) => contract.id === saved.id)
      ? contracts.map((contract) => contract.id === saved.id ? saved : contract)
      : [...contracts, saved];
    onUpdate({ contracts: next });
    setDraft(null);
  };

  return (
    <div className="space-y-4 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="font-semibold">Support contracts ({activeCount} active)</h3>
        {canEdit && <button type="button" onClick={() => editContract()} className="rounded-md bg-teal-700 px-3 py-1.5 text-xs font-semibold text-white">Add contract</button>}
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-600">
        <strong>Fallback first-response target</strong>
        <span>{durationMinutes(company.slaResponseTime) ? company.slaResponseTime : "—"}</span>
        {canEdit && <button type="button" onClick={() => { setError(""); setFallback(company.slaResponseTime); }} className="font-semibold text-teal-700 hover:text-teal-800">Edit target</button>}
      </div>
      {contracts.length ? <div className="overflow-x-auto"><table className="w-full text-left text-xs">
        <thead className="bg-slate-50 text-slate-600"><tr>{["Reference", "Covered services", "Status", "Start date", "Expiry date", "SLA"].map((label) => <th key={label} className="px-2 py-2">{label}</th>)}{canEdit && <th className="px-2 py-2">Action</th>}</tr></thead>
        <tbody className="divide-y divide-slate-200">{contracts.map((contract) => <tr key={contract.id}>
          <td className="px-2 py-2 font-semibold">{contract.reference}</td>
          <td className="px-2 py-2">{contract.serviceIds.map((id) => services.find((service) => service.id === id)?.name ?? id).join(", ")}</td>
          <td className="px-2 py-2">{contractStatus(contract)}</td>
          <td className="px-2 py-2">{contract.startsOn || "—"}</td>
          <td className="px-2 py-2">{contract.endsOn || "—"}</td>
          <td className="px-2 py-2">{contract.slaPolicy ? "Contract override" : "Default policy"}</td>
          {canEdit && <td className="px-2 py-2"><button type="button" onClick={() => editContract(contract)} className="font-semibold text-teal-700">Edit<span className="sr-only"> {contract.reference}</span></button></td>}
        </tr>)}</tbody>
      </table></div> : <p className="text-slate-600">No support contracts recorded.</p>}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-3">
        <h3 className="font-semibold">Subscribed services</h3>
        {canEdit && <button type="button" onClick={() => setSubscriptions(company.subscribedServices.map((reference) => services.find((service) => matchesService(service, reference))?.id ?? reference))} className="text-xs font-semibold text-teal-700">Edit subscriptions</button>}
      </div>
      {company.subscribedServices.length ? <ul className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
        {company.subscribedServices.map((reference) => {
          const service = services.find((item) => matchesService(item, reference));
          const href = service && getServiceHref?.(service);
          return <li key={reference}>{service && href ? <Link to={href} className="font-semibold text-teal-700 hover:underline">{service.name}</Link> : service?.name ?? reference}</li>;
        })}
      </ul> : <p className="text-slate-600">No subscribed services.</p>}
      {draft && <DetailEditDialog title={contracts.some((contract) => contract.id === draft.id) ? "Edit support contract" : "Add support contract"} onCancel={() => setDraft(null)} onSave={saveContract}>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-xs">Reference <span className="group relative inline-flex align-middle"><button type="button" aria-label="About contract reference" className="inline-flex h-4 w-4 items-center justify-center rounded-full text-slate-500 hover:text-slate-800 focus-visible:outline-2 focus-visible:outline-teal-600"><span aria-hidden="true" className="material-symbols-outlined text-[15px]">info</span></button><span role="tooltip" className="pointer-events-none invisible absolute left-0 top-full z-20 mt-1 w-56 rounded-lg bg-slate-900 px-2.5 py-2 text-left text-[11px] font-medium leading-relaxed text-white opacity-0 shadow-lg group-hover:visible group-hover:opacity-100 group-focus-visible:visible group-focus-visible:opacity-100">Enter the unique reference shown on the company’s support contract.</span></span><input className={formControlClassName} required value={draft.reference} onChange={(event) => setDraft({ ...draft, reference: event.target.value })} /></label>
          <div className="min-w-0"><span className="mb-1 block text-xs">Contract status</span><SelectDropdown label="Contract status" options={["Active", "Inactive"].map((value) => ({ value, label: value }))} value={draft.status} onChange={(value) => setDraft({ ...draft, status: value as SupportContract["status"] })} className="w-full" /></div>
          <label className="text-xs">Start date<input className={formControlClassName} type="date" value={draft.startsOn ?? ""} onChange={(event) => setDraft({ ...draft, startsOn: event.target.value || undefined })} /></label>
          <label className="text-xs">Expiry date<input className={formControlClassName} type="date" value={draft.endsOn ?? ""} onChange={(event) => setDraft({ ...draft, endsOn: event.target.value || undefined })} /></label>
        </div>
        <fieldset className="space-y-2">
          <legend className="mb-1 text-xs font-semibold text-slate-700">Covered services</legend>
          {serviceOptions.length ? <div className="grid gap-2 sm:grid-cols-2">
            {serviceOptions.map((option) => {
              const selected = draft.serviceIds.includes(option.value);
              return <label key={option.value} className={`relative flex min-h-10 cursor-pointer items-center rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${selected ? "border-teal-600 bg-teal-50 text-teal-900" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"}`}>
                <input type="checkbox" className="peer sr-only" checked={selected} onChange={(event) => setDraft((current) => current ? { ...current, serviceIds: event.target.checked ? [...current.serviceIds, option.value] : current.serviceIds.filter((id) => id !== option.value) } : current)} />
                <span className="min-w-0 flex-1">{option.label}</span>
                {selected && <span aria-hidden="true" className="material-symbols-outlined ml-2 text-base text-teal-700">check_circle</span>}
                <span className="pointer-events-none absolute inset-0 rounded-lg peer-focus-visible:ring-2 peer-focus-visible:ring-teal-600 peer-focus-visible:ring-offset-2" />
              </label>;
            })}
          </div> : <p className="px-2 py-1 text-xs text-slate-500">No services are available.</p>}
        </fieldset>
        <section className={`overflow-hidden rounded-lg border ${draft.slaPolicy ? "border-teal-200 bg-teal-50/40" : "border-slate-200 bg-slate-50/50"}`}>
          <button type="button" aria-expanded={Boolean(draft.slaPolicy)} onClick={() => setDraft({ ...draft, slaPolicy: draft.slaPolicy ? undefined : { targets: {} } })} className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left hover:bg-white/70">
            <span><span className="block text-sm font-semibold text-slate-800">Custom SLA policy</span><span className="mt-0.5 block text-xs text-slate-500">Set contract-specific response and resolution targets.</span></span>
            <span aria-hidden="true" className={`material-symbols-outlined shrink-0 text-xl text-slate-500 transition-transform ${draft.slaPolicy ? "rotate-180" : ""}`}>expand_more</span>
          </button>
          {draft.slaPolicy && <div className="border-t border-slate-200 bg-white p-3"><SlaPolicyFields value={draft.slaPolicy} onChange={(slaPolicy) => setDraft({ ...draft, slaPolicy })} /></div>}
        </section>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      </DetailEditDialog>}
      {subscriptions && <DetailEditDialog title="Edit subscribed services" onCancel={() => setSubscriptions(null)} onSave={(event) => {
        event.preventDefault();
        onUpdate({ subscribedServices: subscriptions });
        setSubscriptions(null);
      }}>
        <fieldset className="space-y-2">
          <legend className="mb-2 text-xs font-semibold text-slate-700">Subscribed services</legend>
          {[...serviceOptions, ...subscriptions.filter((id) => !services.some((service) => service.id === id)).map((id) => ({ value: id, label: id }))].map((option) => (
            <label key={option.value} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-50">
              <input type="checkbox" checked={subscriptions.includes(option.value)} onChange={(event) => setSubscriptions((current) => current ? event.target.checked ? [...current, option.value] : current.filter((id) => id !== option.value) : [])} />
              {option.label}
            </label>
          ))}
        </fieldset>
      </DetailEditDialog>}
      {fallback !== null && <DetailEditDialog title="Edit fallback first-response target" onCancel={() => setFallback(null)} onSave={(event) => {
        event.preventDefault();
        const target = fallback.trim();
        if (target && !durationMinutes(target)) { setError("Enter a duration such as 30m, 4h, or 1d."); return; }
        onUpdate({ slaResponseTime: target });
        setFallback(null);
      }}>
        <label className="text-xs">First-response duration<input className={formControlClassName} value={fallback} placeholder="e.g. 4h" onChange={(event) => setFallback(event.target.value)} /></label>
        <p className="text-xs text-slate-600">Used when the contract and service have no first-response target.</p>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      </DetailEditDialog>}
    </div>
  );
}

