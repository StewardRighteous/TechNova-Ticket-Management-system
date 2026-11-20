import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTicketStore } from "../../store/barrel";
import type { ServiceLine } from "../../types/barrel";
import { FormField, formControlClassName, SelectDropdown } from "../common/barrel";

export const CreateServicePage: React.FC = () => {
  const { data, addService, addToast } = useTicketStore();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [department, setDepartment] = useState(data.departments?.[0]?.name || "Support");
  const [lead, setLead] = useState(data.employees[0]?.name || "");
  const [slaValue, setSlaValue] = useState("4");
  const [slaUnit, setSlaUnit] = useState("Hours");
  const [uptimeValue, setUptimeValue] = useState("99.9");
  const [description, setDescription] = useState("");
  const [technologies, setTechnologies] = useState<string[]>([]);
  const [technologyInput, setTechnologyInput] = useState("");
  const [error, setError] = useState("");
  const [step, setStep] = useState(1);
  const slaTarget = `${slaValue}${slaUnit === "Minutes" ? "m" : slaUnit === "Hours" ? "h" : "d"}`;
  const uptime = `${uptimeValue}%`;

  const validateStep = (currentStep: number) => {
    if (currentStep === 1 && (!name.trim() || !code.trim() || !department || !lead)) { setError("Complete the service details to continue."); return false; }
    if (currentStep === 2 && (!/^\d+(?:\.\d+)?$/.test(slaValue.trim()) || !/^\d+(?:\.\d+)?$/.test(uptimeValue.trim()) || Number(uptimeValue) <= 0 || Number(uptimeValue) > 100)) { setError("Enter valid response time and uptime targets to continue."); return false; }
    setError("");
    return true;
  };

  const addTechnology = (value: string) => {
    const normalized = value.trim();
    if (normalized && !technologies.some((item) => item.toLowerCase() === normalized.toLowerCase())) setTechnologies((items) => [...items, normalized]);
    setTechnologyInput("");
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedCode = code.trim().toUpperCase();
    if (!name.trim() || !normalizedCode || !department || !lead) { setError("Complete all required fields."); return; }
    if (data.services.some((service) => service.code.toLowerCase() === normalizedCode || service.name.toLowerCase() === name.trim().toLowerCase())) { setError("A service with this name or code already exists."); return; }
    if (!/^\d+(?:\.\d+)?$/.test(slaValue.trim())) { setError("Response time must be a positive number."); return; }
    if (!/^\d+(?:\.\d+)?$/.test(uptimeValue.trim()) || Number(uptimeValue) <= 0 || Number(uptimeValue) > 100) { setError("Uptime target must be between 0 and 100%."); return; }
    setError("");
    const service: ServiceLine = { id: `svc-${crypto.randomUUID()}`, name: name.trim(), code: normalizedCode, department, lead, activeTickets: 0, slaTarget, uptime, description: description.trim(), technologies, status: "Active" };
    addService(service);
    addToast("Service created successfully.", "success");
    navigate(`/services/${encodeURIComponent(service.id)}`);
  };

  const cancel = () => {
    if (name || code || description || technologies.length) {
      if (window.confirm("Discard this service draft?")) navigate("/services");
    } else navigate("/services");
  };

  return <main className="px-5 py-5 sm:px-7 sm:py-6"><form onSubmit={submit} className="space-y-5">
      <div className="flex items-center gap-4 text-sm font-semibold text-[#384b68]"><span>{step} of 2</span><div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[#dfe5ef]"><div className="h-full rounded-full bg-[#25294e] transition-all" style={{ width: `${(step / 2) * 100}%` }} /></div><span className="hidden text-slate-500 sm:inline">{step === 1 ? "Service details" : "Operational targets"}</span></div>
      {error && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
      {step === 1 && <div className="space-y-4"><h2 className="text-[17px] font-bold text-[#1f2041]">Service details</h2>
      <div className="service-create-grid">
        <FormField label="Service name *"><input className={formControlClassName} required value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Customer Portal" /></FormField>
        <FormField label="Service code *"><input className={formControlClassName} required value={code} onChange={(event) => setCode(event.target.value)} placeholder="e.g. SRV-001" /></FormField>
      <FormField label="Department *"><SelectDropdown label="Department" value={department} onChange={setDepartment} options={(data.departments || []).map((item) => ({ value: item.name, label: item.name }))} required /></FormField>
        <FormField label="Service lead *"><SelectDropdown label="Service lead" value={lead} onChange={setLead} options={data.employees.map((item) => ({ value: item.name, label: item.name }))} required /></FormField>
      </div>
      </div>}
      {step === 2 && <section className="service-create-targets">
        <div className="mb-4 flex items-center justify-between"><h2 className="text-[17px] font-bold text-[#1f2041]">Operational targets</h2><span className="rounded-lg bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-800">Target uptime {uptime}</span></div>
        <div className="service-create-grid service-create-target-grid">
          <FormField label="Response time SLA *"><div className="service-create-composite"><input aria-label="Response time" type="number" min="1" step="any" required value={slaValue} onChange={(event) => setSlaValue(event.target.value)} /><SelectDropdown label="Response time unit" value={slaUnit} onChange={setSlaUnit} options={["Minutes", "Hours", "Days"].map((item) => ({ value: item, label: item }))} /><span>e.g. 4 Hours</span></div></FormField>
          <FormField label="Uptime target *"><div className="service-create-composite service-create-percent"><input aria-label="Uptime target" type="number" min="0.1" max="100" step="0.1" required value={uptimeValue} onChange={(event) => setUptimeValue(event.target.value)} /><span className="service-create-suffix">%</span><span>e.g. 99.9%</span></div></FormField>
          <FormField label="Technologies" className="service-create-wide"><div className="service-create-tags" onClick={() => document.getElementById("service-technology-input")?.focus()}>{technologies.map((technology) => <span className="service-create-tag" key={technology}>{technology}<button type="button" aria-label={`Remove ${technology}`} onClick={(event) => { event.stopPropagation(); setTechnologies((items) => items.filter((item) => item !== technology)); }}>×</button></span>)}<input id="service-technology-input" value={technologyInput} onChange={(event) => setTechnologyInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === ",") { event.preventDefault(); addTechnology(technologyInput); } if (event.key === "Backspace" && !technologyInput && technologies.length) setTechnologies((items) => items.slice(0, -1)); }} onBlur={() => technologyInput && addTechnology(technologyInput)} placeholder="Add technology..." /><span className="material-symbols-outlined">expand_more</span></div></FormField>
          <FormField label="Description" className="service-create-wide"><textarea className={formControlClassName} rows={3} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Briefly describe the service, its purpose, and key functionality." /></FormField>
        </div>
      </section>}
      <footer className="flex items-center justify-between border-t border-slate-200 pt-5"><button type="button" onClick={step === 1 ? cancel : () => { setError(""); setStep(1); }} className="rounded-lg border border-[#2c3158] px-5 py-2.5 text-sm font-semibold text-[#25294e] hover:bg-slate-50">{step === 1 ? "Cancel" : "Back"}</button><p className="hidden text-sm text-slate-500 md:block">{step === 1 ? "Complete this step to continue." : "Set the service level targets."}</p>{step === 1 ? <button type="button" onClick={() => { if (validateStep(1)) setStep(2); }} className="rounded-lg bg-[#25294e] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#1d2146]">Continue <span aria-hidden="true">→</span></button> : <button type="submit" className="rounded-lg bg-[#0e858d] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#0b7279]">Create service</button>}</footer>
    </form></main>;
};
