import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTicketStore } from "../../store/barrel";
import type { Company } from "../../types/barrel";
import { StepAction, StepProgress, ConfirmationDialog, FormActions, Button, Checkbox, Heading, Input, Label, FormField, SelectDropdown } from "../../ui/barrel";
import { companyTiers } from "./companyTiers";

export const CreateCompanyPage: React.FC = () => {
  const { data, addCompany, addToast } = useTicketStore();
  const navigate = useNavigate();
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [name, setName] = useState("");
  const code = name.trim().replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").toUpperCase();
  const [tier, setTier] = useState("Standard Business");
  const [contactName, setContactName] = useState("");
  const [contactRole, setContactRole] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [accountManager, setAccountManager] = useState(data.employees.find((item) => item.role === "account_manager")?.name || data.employees[0]?.name || "");
  const [preferredChannel, setPreferredChannel] = useState<Company["preferredChannel"]>("email");
  const [subscribedServices, setSubscribedServices] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);

  const validateStep = (currentStep: number) => {
    if (currentStep === 1 && (!name.trim() || !accountManager || !code)) { setError("Complete the company details to continue."); return false; }
    if (currentStep === 2 && (!contactName.trim() || !contactRole.trim() || !contactEmail.trim() || !contactPhone.trim())) { setError("Complete the primary contact details to continue."); return false; }
    if (currentStep === 2 && !/^\S+@\S+\.\S+$/.test(contactEmail.trim())) { setError("Enter a valid work email to continue."); return false; }
    setError("");
    return true;
  };

  const nextStep = () => { if (validateStep(step)) setStep(2); };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (step < 2) { nextStep(); return; }
    const normalizedCode = code.trim().toUpperCase();
    if (!name.trim() || !contactName.trim() || !contactRole.trim() || !contactEmail.trim() || !contactPhone.trim()) { setError("Complete all required fields."); return; }
    if (data.companies.some((item) => item.code.toLowerCase() === normalizedCode || item.contactEmail.toLowerCase() === contactEmail.trim().toLowerCase())) { setError("Company code or contact email already exists."); return; }
    if (!normalizedCode) { setError("Enter a company name that produces a usable company code."); return; }
    setError("");
    const company: Company = { id: `comp-${crypto.randomUUID()}`, name: name.trim(), code: normalizedCode, tier, contactName: contactName.trim(), contactRole: contactRole.trim(), contactEmail: contactEmail.trim(), contactPhone: contactPhone.trim(), contacts: [{ id: `contact-${crypto.randomUUID()}`, name: contactName.trim(), email: contactEmail.trim(), phone: contactPhone.trim() }], preferredChannel, activeContracts: 0, activeTickets: 0, slaResponseTime: "4h", accountManager, subscribedServices, status: "Active" };
    addCompany(company);
    addToast("Company created successfully.", "success");
    navigate(`/companies/${encodeURIComponent(company.id)}`);
  };

  const cancel = () => {
    if (name || contactName || contactEmail) setConfirmDiscard(true);
    else navigate("/companies");
  };

  return <main className="px-5 py-5 sm:px-7 sm:py-6"><form onSubmit={submit} className="space-y-5">
      <StepProgress steps={["Company details", "Primary contact"]} currentStep={step} />
      {error && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
      {step === 1 && <section className="space-y-4">
        <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
          <FormField label="Company name" required><Input required value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Acme Corporation" /></FormField>
          <FormField label={<span className="flex items-center justify-between gap-2"><span>Company code</span><span className="text-[11px] font-normal text-slate-500">ⓘ Auto-generated</span></span>}><Input className="bg-teal-50 font-semibold text-teal-800" value={code} readOnly placeholder="Generated automatically" /></FormField>
          <FormField label="Account tier" required><SelectDropdown label="Account tier" value={tier} onChange={setTier} options={companyTiers.map((item) => ({ value: item, label: item }))} required /></FormField>
          <FormField label="Account manager" required><SelectDropdown label="Account manager" value={accountManager} onChange={setAccountManager} options={data.employees.map((item) => ({ value: item.name, label: item.name }))} required /></FormField>
        </div>
      </section>}
      {step === 2 && <section className="space-y-4">
        <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
          <FormField label="Name" required><Input required value={contactName} onChange={(event) => setContactName(event.target.value)} placeholder="e.g. Jamie Lee" /></FormField>
          <FormField label="Role" required><Input required value={contactRole} onChange={(event) => setContactRole(event.target.value)} placeholder="e.g. IT manager" /></FormField>
          <FormField label="Work email" required><Input required type="email" value={contactEmail} onChange={(event) => setContactEmail(event.target.value)} placeholder="name@company.com" /></FormField>
          <FormField label="Phone" required><Input required type="tel" value={contactPhone} onChange={(event) => setContactPhone(event.target.value)} placeholder="e.g. +1 555 0100" /></FormField>
          <fieldset className="sm:col-span-2"><legend className="mb-1.5 text-sm font-semibold text-slate-700">Preferred channel <span className="text-red-600">*</span></legend><div className="flex flex-wrap gap-2">{(["email", "phone", "whatsapp"] as const).map((channel) => <Label variant="plain" key={channel} className={`flex cursor-pointer items-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold capitalize ${preferredChannel === channel ? "border-teal-700 bg-teal-700 text-white" : "border-slate-300 text-slate-700 hover:border-teal-500"}`}><Input appearance="plain" className="sr-only" type="radio" name="preferred-channel" value={channel} checked={preferredChannel === channel} onChange={() => setPreferredChannel(channel)} />{channel === "email" ? "✉" : channel === "phone" ? "⌕" : "◉"} {channel === "whatsapp" ? "SMS / WhatsApp" : channel}</Label>)}</div></fieldset>
        </div>
        <section className="space-y-3 border-t border-slate-100 pt-3"><Heading variant="plain" className="text-sm font-bold text-[#1f2041]">Subscribed services <span className="font-normal text-slate-500">(optional)</span></Heading><p className="text-sm text-slate-500">Select the services this company will use.</p><div className="grid gap-2 sm:grid-cols-2">{data.services.map((item) => <Label variant="plain" key={item.id} className="flex min-h-10 cursor-pointer items-center gap-3 rounded-lg border border-[#c4d2e5] px-3 text-sm font-medium text-slate-800 hover:border-teal-500"><Checkbox checked={subscribedServices.includes(item.id)} onChange={(event) => setSubscribedServices((current) => event.target.checked ? [...current, item.id] : current.filter((id) => id !== item.id))} className="h-4 w-4 rounded border-slate-300 accent-teal-700" />{item.name}</Label>)}</div></section>
      </section>}
      <FormActions>
        <Button cancel={step === 1} type="button" onClick={step === 1 ? cancel : () => { setError(""); setStep(1); }}>{step === 1 ? "Cancel" : "Back"}</Button><StepAction onContinue={step === 1 ? nextStep : undefined} submitLabel="Create company" />
      </FormActions>
    </form>
    {confirmDiscard && <ConfirmationDialog
        title="Discard this company draft?"
        description="Your unsaved changes will be lost."
        cancelLabel="Keep editing"
        confirmLabel="Discard draft"
        onCancel={() => setConfirmDiscard(false)}
        onConfirm={() => navigate("/companies")}
        danger
      />}
  </main>;
};
