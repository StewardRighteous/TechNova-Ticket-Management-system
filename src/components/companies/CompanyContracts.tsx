import { useState, type FormEvent } from "react";
import type { Company, ServiceLine, SupportContract } from "../../types/barrel";
import { matchesService } from "../../utils/matchesService";
import { contractStatus, durationMinutes, isContractActive, policyError } from "../../utils/supportPolicy";
import { CategoryBadge, TableValue, FieldHint, ActionLink, Button, Checkbox, PaginatedDataTable, DetailEditDialog, DetailFieldGroup, FormField, Icon, Input, Label, TableBody, TableCell, TableHead, TableHeader, TableRow, SelectDropdown } from "../../ui/barrel";
import { SlaPolicyFields } from "../shared/SlaPolicyFields";

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
    <div className="@container space-y-3">
      <div className="space-y-3">
        <DetailFieldGroup title={`Support contracts (${activeCount} active)`} icon="description" actions={canEdit && <Button size="small" tone="primary" type="button" onClick={() => editContract()}><Icon aria-hidden="true" className="text-sm">add</Icon>Add contract</Button>}>
          <div className="col-span-full">
            {contracts.length ? <PaginatedDataTable rows={contracts} scroll>
              {(pageRows) => <>
                <TableHead tone="plain" className="bg-slate-50 text-slate-600"><TableRow>{["Reference", "Covered services", "Status", "Start date", "Expiry date", "SLA"].map((label) => <TableHeader density="compact" key={label}>{label}</TableHeader>)}{canEdit && <TableHeader density="compact">Action</TableHeader>}</TableRow></TableHead>
                <TableBody className="divide-slate-200">{pageRows.map((contract) => <TableRow key={contract.id}>
                  <TableCell density="compact" className="font-semibold">{contract.reference}</TableCell>
                  <TableCell density="compact">{contract.serviceIds.map((id) => services.find((service) => service.id === id)?.name ?? id).join(", ")}</TableCell>
                  <TableCell density="compact"><CategoryBadge variant="status" category={contractStatus(contract)} /></TableCell>
                  <TableCell density="compact"><TableValue icon="calendar_today">{contract.startsOn}</TableValue></TableCell>
                  <TableCell density="compact"><TableValue icon="event">{contract.endsOn}</TableValue></TableCell>
                  <TableCell density="compact"><CategoryBadge variant="policy" category={contract.slaPolicy ? "Contract override" : "Default policy"} /></TableCell>
                  {canEdit && <TableCell density="compact"><Button tone="plain" type="button" onClick={() => editContract(contract)} className="font-semibold text-teal-700">Edit<span className="sr-only"> {contract.reference}</span></Button></TableCell>}
                </TableRow>)}</TableBody>
              </>}
            </PaginatedDataTable> : <p className="text-xs text-slate-600">No support contracts recorded.</p>}
          </div>
        </DetailFieldGroup>
        <DetailFieldGroup title="Subscribed services" icon="apps" actions={canEdit && <Button size="small" type="button" onClick={() => setSubscriptions(company.subscribedServices.map((reference) => services.find((service) => matchesService(service, reference))?.id ?? reference))}><Icon aria-hidden="true" className="text-sm">edit</Icon>Edit subscriptions</Button>}>
          <div className="col-span-full">
            {company.subscribedServices.length ? <ul className="flex flex-wrap gap-x-4 gap-y-2 text-xs">
              {company.subscribedServices.map((reference) => {
                const service = services.find((item) => matchesService(item, reference));
                const href = service && getServiceHref?.(service);
                return <li key={reference}>{service && href ? <ActionLink to={href} className="font-semibold text-teal-700 hover:underline">{service.name}</ActionLink> : service?.name ?? reference}</li>;
              })}
            </ul> : <p className="text-xs text-slate-600">No subscribed services.</p>}
          </div>
        </DetailFieldGroup>
        <DetailFieldGroup title="SLA fallback" icon="timer" actions={canEdit && <Button size="small" type="button" onClick={() => { setError(""); setFallback(company.slaResponseTime); }}><Icon aria-hidden="true" className="text-sm">edit</Icon>Edit target</Button>}>
          <FormField label="First-response target" density="compact">
            <Input appearance="compact" readOnly value={durationMinutes(company.slaResponseTime) ? company.slaResponseTime : "N/A"} />
          </FormField>
        </DetailFieldGroup>
      </div>
      {draft && <DetailEditDialog title={contracts.some((contract) => contract.id === draft.id) ? "Edit support contract" : "Add support contract"} onCancel={() => setDraft(null)} onSave={saveContract}>
        <div className="grid gap-3 sm:grid-cols-2">
          <Label variant="compact">Reference <FieldHint label="contract reference">Enter the unique reference shown on the company’s support contract.</FieldHint><Input required value={draft.reference} onChange={(event) => setDraft({ ...draft, reference: event.target.value })} /></Label>
          <div className="min-w-0"><span className="mb-1 block text-xs">Contract status</span><SelectDropdown label="Contract status" options={["Active", "Inactive"].map((value) => ({ value, label: value }))} value={draft.status} onChange={(value) => setDraft({ ...draft, status: value as SupportContract["status"] })} className="w-full" /></div>
          <Label variant="compact">Start date<Input type="date" value={draft.startsOn ?? ""} onChange={(event) => setDraft({ ...draft, startsOn: event.target.value || undefined })} /></Label>
          <Label variant="compact">Expiry date<Input type="date" value={draft.endsOn ?? ""} onChange={(event) => setDraft({ ...draft, endsOn: event.target.value || undefined })} /></Label>
        </div>
        <fieldset className="space-y-2">
          <legend className="mb-1 text-xs font-semibold text-slate-700">Covered services</legend>
          {serviceOptions.length ? <div className="grid gap-2 sm:grid-cols-2">
            {serviceOptions.map((option) => {
              const selected = draft.serviceIds.includes(option.value);
              return <Label variant="plain" key={option.value} className={`relative flex min-h-10 cursor-pointer items-center rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${selected ? "border-teal-600 bg-teal-50 text-teal-900" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"}`}>
                <Checkbox className="peer sr-only" checked={selected} onChange={(event) => setDraft((current) => current ? { ...current, serviceIds: event.target.checked ? [...current.serviceIds, option.value] : current.serviceIds.filter((id) => id !== option.value) } : current)} />
                <span className="min-w-0 flex-1">{option.label}</span>
                {selected && <Icon aria-hidden="true" className="ml-2 text-base text-teal-700">check_circle</Icon>}
                <span className="pointer-events-none absolute inset-0 rounded-lg peer-focus-visible:ring-2 peer-focus-visible:ring-teal-600 peer-focus-visible:ring-offset-2" />
              </Label>;
            })}
          </div> : <p className="px-2 py-1 text-xs text-slate-500">No services are available.</p>}
        </fieldset>
        <section className={`overflow-hidden rounded-lg border ${draft.slaPolicy ? "border-teal-200 bg-teal-50/40" : "border-slate-200 bg-slate-50/50"}`}>
          <Button tone="plain" type="button" aria-expanded={Boolean(draft.slaPolicy)} onClick={() => setDraft({ ...draft, slaPolicy: draft.slaPolicy ? undefined : { targets: {} } })} className="flex w-full items-center justify-between gap-3 px-3 py-2.5 text-left hover:bg-white/70">
            <span><span className="block text-sm font-semibold text-slate-800">Custom SLA policy</span><span className="mt-0.5 block text-xs text-slate-500">Set contract-specific response and resolution targets.</span></span>
            <span aria-hidden="true" className={`material-symbols-outlined shrink-0 text-xl text-slate-500 transition-transform ${draft.slaPolicy ? "rotate-180" : ""}`}>expand_more</span>
          </Button>
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
            <Label variant="plain" key={option.value} className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-slate-700 hover:bg-slate-50">
              <Checkbox checked={subscriptions.includes(option.value)} onChange={(event) => setSubscriptions((current) => current ? event.target.checked ? [...current, option.value] : current.filter((id) => id !== option.value) : [])} />
              {option.label}
            </Label>
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
        <Label variant="compact">First-response duration<Input value={fallback} placeholder="e.g. 4h" onChange={(event) => setFallback(event.target.value)} /></Label>
        <p className="text-xs text-slate-600">Used when the contract and service have no first-response target.</p>
        {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      </DetailEditDialog>}
    </div>
  );
}

