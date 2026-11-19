import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTicketStore } from "../../store/barrel";
import type { Company } from "../../types/barrel";
import { FormField, formControlClassName } from "../common/barrel";

const compactControl = `${formControlClassName} rounded-md border border-slate-300 px-3 py-2 focus:border-teal-600 focus:ring-teal-600`;

export const CreateCompanyPage: React.FC = () => {
  const { data, addCompany, addToast } = useTicketStore();
  const navigate = useNavigate();
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

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
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
    if ((name || contactName || contactEmail) && !window.confirm("Discard this company draft?")) return;
    navigate("/companies");
  };

  return <main className="mx-auto w-full max-w-[1440px] px-4 py-3 lg:px-6">
    <form onSubmit={submit} className="space-y-2.5">
      {error && <p role="alert" className="shrink-0 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
      <section className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <SectionHeading icon="▦" title="Company" subtitle="Basic company details and account ownership." />
        <div className="grid gap-x-4 gap-y-2 sm:grid-cols-2 sm:pl-[5.75rem]">
          <FormField label="Company name *"><input className={compactControl} required value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Acme Corporation" /></FormField>
          <FormField label="Company code"><div className="relative"><input className={`${compactControl} bg-teal-50 pr-28 font-semibold text-teal-800`} value={code} readOnly placeholder="Generated automatically" /><span className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white px-2 py-1 text-[11px] text-slate-500">ⓘ Auto-generated</span></div></FormField>
          <FormField label="Account tier *"><select className={compactControl} value={tier} onChange={(event) => setTier(event.target.value)}>{["Standard Business", "Premium", "Enterprise"].map((item) => <option key={item}>{item}</option>)}</select></FormField>
          <FormField label="Account manager *"><select className={compactControl} value={accountManager} onChange={(event) => setAccountManager(event.target.value)} required>{data.employees.map((item) => <option key={item.id}>{item.name}</option>)}</select></FormField>
        </div>
      </section>
      <section className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <SectionHeading icon="♙" title="Primary contact" subtitle="The main point of contact for this company." />
        <div className="grid gap-x-4 gap-y-2 sm:grid-cols-2 sm:pl-[5.75rem]">
          <FormField label="Name *"><input className={compactControl} required value={contactName} onChange={(event) => setContactName(event.target.value)} placeholder="e.g. Jamie Lee" /></FormField>
          <FormField label="Role *"><input className={compactControl} required value={contactRole} onChange={(event) => setContactRole(event.target.value)} placeholder="e.g. IT manager" /></FormField>
          <FormField label="Work email *"><input className={compactControl} required type="email" value={contactEmail} onChange={(event) => setContactEmail(event.target.value)} placeholder="name@company.com" /></FormField>
          <FormField label="Phone *"><input className={compactControl} required type="tel" value={contactPhone} onChange={(event) => setContactPhone(event.target.value)} placeholder="e.g. +1 555 0100" /></FormField>
          <fieldset className="sm:col-span-2"><legend className="mb-1.5 text-sm font-semibold text-slate-700">Preferred channel *</legend><div className="flex flex-wrap gap-2">{(["email", "phone", "whatsapp"] as const).map((channel) => <label key={channel} className={`flex cursor-pointer items-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold capitalize ${preferredChannel === channel ? "border-teal-700 bg-teal-700 text-white" : "border-slate-300 text-slate-700 hover:border-teal-500"}`}><input className="sr-only" type="radio" name="preferred-channel" value={channel} checked={preferredChannel === channel} onChange={() => setPreferredChannel(channel)} />{channel === "email" ? "✉" : channel === "phone" ? "⌕" : "◉"} {channel === "whatsapp" ? "SMS / WhatsApp" : channel}</label>)}</div></fieldset>
        </div>
      </section>
      <section className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
        <SectionHeading icon="◇" title="Services" subtitle="Select the services this company will use." />
        <div className="grid gap-1.5 sm:grid-cols-2 sm:pl-[5.75rem]">{data.services.map((item) => <label key={item.id} className="flex min-h-9 cursor-pointer items-center gap-3 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-800 hover:border-teal-500"><input type="checkbox" checked={subscribedServices.includes(item.id)} onChange={(event) => setSubscribedServices((current) => event.target.checked ? [...current, item.id] : current.filter((id) => id !== item.id))} className="h-4 w-4 rounded border-slate-300 accent-teal-700" />{item.name}</label>)}</div>
      </section>
      <footer className="flex items-center justify-between border-t border-slate-200 bg-white py-2">
        <button type="button" onClick={cancel} className="rounded-lg border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Cancel</button><p className="hidden text-sm italic text-slate-500 md:block">You can add more contacts later.</p><button type="submit" className="rounded-lg bg-teal-700 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-800">Create company</button>
      </footer>
    </form>
  </main>;
};

const SectionHeading: React.FC<{ icon: string; title: string; subtitle: string }> = ({ icon, title, subtitle }) => <div className="mb-2 flex items-center gap-3"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-teal-50 text-xl font-semibold text-teal-700">{icon}</span><div className="border-l border-slate-200 pl-3"><h2 className="text-base font-bold leading-tight text-slate-900">{title}</h2><p className="text-xs text-slate-500">{subtitle}</p></div></div>;
