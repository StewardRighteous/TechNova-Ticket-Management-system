import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTicketStore } from "../../store/barrel";
import type { ServiceLine } from "../../types/barrel";
import { FormField, formControlClassName } from "../common/barrel";

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
  const slaTarget = `${slaValue}${slaUnit === "Minutes" ? "m" : slaUnit === "Hours" ? "h" : "d"}`;
  const uptime = `${uptimeValue}%`;

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

  return <main className="service-create-page">
    <nav aria-label="Breadcrumb" className="service-create-breadcrumb"><button type="button" onClick={() => navigate("/services")}>Services</button><span aria-hidden="true">›</span><span>Add a service</span></nav>
    <header className="service-create-heading"><h1>Add a service</h1><p>Define ownership and service targets.</p></header>
    <section className="service-create-banner"><span className="service-create-banner-icon"><span className="material-symbols-outlined">layers</span></span><span className="service-create-banner-copy"><strong>New service</strong><span>Create a service line, assign ownership, and set operational targets like response time and uptime.</span></span></section>

    <form onSubmit={submit} className="service-create-card">
      <div className="service-create-section-heading"><span className="service-create-icon"><span className="material-symbols-outlined">info</span></span><div><h2>Service details</h2><p>Basic information and ownership for the service.</p></div></div>
      <div className="service-create-grid">
        {error && <p role="alert" className="service-create-error">{error}</p>}
        <FormField label="Service name *"><input className={formControlClassName} required value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Customer Portal" /></FormField>
        <FormField label="Service code *"><input className={formControlClassName} required value={code} onChange={(event) => setCode(event.target.value)} placeholder="e.g. SRV-001" /></FormField>
        <FormField label="Department *"><select className={formControlClassName} value={department} required onChange={(event) => setDepartment(event.target.value)}>{(data.departments || []).map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}</select></FormField>
        <FormField label="Service lead *"><select className={formControlClassName} value={lead} required onChange={(event) => setLead(event.target.value)}>{data.employees.map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}</select></FormField>
      </div>

      <section className="service-create-targets">
        <div className="service-create-section-heading"><span className="service-create-icon"><span className="material-symbols-outlined">track_changes</span></span><div><h2>Operational targets</h2><p>Define service level targets and related configuration.</p></div><span className="service-create-uptime"><span className="material-symbols-outlined">monitoring</span>Target uptime {uptime}</span></div>
        <div className="service-create-grid service-create-target-grid">
          <FormField label="Response time SLA *"><div className="service-create-composite"><input aria-label="Response time" type="number" min="1" step="any" required value={slaValue} onChange={(event) => setSlaValue(event.target.value)} /><select aria-label="Response time unit" value={slaUnit} onChange={(event) => setSlaUnit(event.target.value)}><option>Minutes</option><option>Hours</option><option>Days</option></select><span>e.g. 4 Hours</span></div></FormField>
          <FormField label="Uptime target *"><div className="service-create-composite service-create-percent"><input aria-label="Uptime target" type="number" min="0.1" max="100" step="0.1" required value={uptimeValue} onChange={(event) => setUptimeValue(event.target.value)} /><span className="service-create-suffix">%</span><span>e.g. 99.9%</span></div></FormField>
          <FormField label="Technologies" className="service-create-wide"><div className="service-create-tags" onClick={() => document.getElementById("service-technology-input")?.focus()}>{technologies.map((technology) => <span className="service-create-tag" key={technology}>{technology}<button type="button" aria-label={`Remove ${technology}`} onClick={(event) => { event.stopPropagation(); setTechnologies((items) => items.filter((item) => item !== technology)); }}>×</button></span>)}<input id="service-technology-input" value={technologyInput} onChange={(event) => setTechnologyInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === ",") { event.preventDefault(); addTechnology(technologyInput); } if (event.key === "Backspace" && !technologyInput && technologies.length) setTechnologies((items) => items.slice(0, -1)); }} onBlur={() => technologyInput && addTechnology(technologyInput)} placeholder="Add technology..." /><span className="material-symbols-outlined">expand_more</span></div></FormField>
          <FormField label="Description" className="service-create-wide"><textarea className={formControlClassName} rows={3} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Briefly describe the service, its purpose, and key functionality." /></FormField>
        </div>
      </section>
      <footer className="service-create-actions"><button type="button" onClick={cancel}>Cancel</button><button type="submit">Create service</button></footer>
    </form>
  </main>;
};
