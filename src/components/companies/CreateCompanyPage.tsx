import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTicketStore } from "../../store/barrel";
import type { Company } from "../../types/barrel";
import { EntityCreatePage, FormField, formControlClassName } from "../common/barrel";

export const CreateCompanyPage: React.FC = () => {
  const { data, addCompany, addToast } = useTicketStore();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const code = name.trim().replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-|-$/g, "").toUpperCase();
  const [tier, setTier] = useState("Standard");
  const [contactName, setContactName] = useState("");
  const [contactRole, setContactRole] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [accountManager, setAccountManager] = useState(data.employees.find((item) => item.role === "account_manager")?.name || data.employees[0]?.name || "");
  const [preferredChannel, setPreferredChannel] = useState<Company["preferredChannel"]>("email");
  const [subscribedServices, setSubscribedServices] = useState<string[]>([]);

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const company: Company = { id: `comp-${crypto.randomUUID()}`, name: name.trim(), code: code.trim().toUpperCase(), tier, contactName: contactName.trim(), contactRole: contactRole.trim(), contactEmail: contactEmail.trim(), contactPhone: contactPhone.trim(), contacts: [{ id: `contact-${crypto.randomUUID()}`, name: contactName.trim(), email: contactEmail.trim(), phone: contactPhone.trim() }], preferredChannel, activeContracts: 0, activeTickets: 0, slaResponseTime: "4h", accountManager, subscribedServices, status: "Active" };
    addCompany(company);
    addToast("Company created successfully.", "success");
    navigate(`/companies/${encodeURIComponent(company.id)}`);
  };

  return <EntityCreatePage title="Add a company" description="Create a customer profile for ticket intake and account tracking." onCancel={() => navigate("/companies")} onSubmit={submit}>
    <FormField label="Company name"><input className={formControlClassName} required value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Acme Corporation" /></FormField>
    <FormField label="Company code"><input className={formControlClassName} required value={code} readOnly placeholder="Generated from company name" /></FormField>
    <FormField label="Account tier"><select className={formControlClassName} value={tier} onChange={(event) => setTier(event.target.value)}>{[...new Set(["Standard", "Premium", "Enterprise", ...data.companies.map((item) => item.tier)])].map((item) => <option key={item}>{item}</option>)}</select></FormField>
    <FormField label="Account manager"><select className={formControlClassName} value={accountManager} onChange={(event) => setAccountManager(event.target.value)}>{data.employees.map((item) => <option key={item.id}>{item.name}</option>)}</select></FormField>
    <FormField label="Primary contact"><input className={formControlClassName} required value={contactName} onChange={(event) => setContactName(event.target.value)} placeholder="e.g. Jamie Lee" /></FormField>
    <FormField label="Contact role"><input className={formControlClassName} required value={contactRole} onChange={(event) => setContactRole(event.target.value)} placeholder="e.g. IT manager" /></FormField>
    <FormField label="Contact email"><input className={formControlClassName} required type="email" value={contactEmail} onChange={(event) => setContactEmail(event.target.value)} placeholder="name@company.com" /></FormField>
    <FormField label="Contact phone"><input className={formControlClassName} required type="tel" value={contactPhone} onChange={(event) => setContactPhone(event.target.value)} placeholder="e.g. +1 555 0100" /></FormField>
    <FormField label="Preferred channel"><select className={formControlClassName} value={preferredChannel} onChange={(event) => setPreferredChannel(event.target.value as Company["preferredChannel"])}><option value="email">Email</option><option value="phone">Phone</option><option value="whatsapp">WhatsApp</option></select></FormField>
    <FormField label="Subscribed services" className="sm:col-span-2"><div className="grid gap-2 sm:grid-cols-2">{data.services.map((item) => <label key={item.id} className="flex items-center gap-3 rounded-lg border border-slate-200 px-3 py-2.5 text-sm text-slate-700"><input type="checkbox" checked={subscribedServices.includes(item.id)} onChange={(event) => setSubscribedServices((current) => event.target.checked ? [...current, item.id] : current.filter((id) => id !== item.id))} className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />{item.name}</label>)}</div></FormField>
  </EntityCreatePage>;
};
