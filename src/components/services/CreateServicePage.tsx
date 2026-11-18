import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTicketStore } from "../../store/barrel";
import type { ServiceLine } from "../../types/barrel";
import { EntityCreatePage, FormField, formControlClassName } from "../common/barrel";

export const CreateServicePage: React.FC = () => {
  const { data, addService, addToast } = useTicketStore();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [department, setDepartment] = useState(data.departments?.[0]?.name || "Support");
  const [lead, setLead] = useState(data.employees[0]?.name || "");
  const [slaTarget, setSlaTarget] = useState("4h");
  const [uptime, setUptime] = useState("99.9%");
  const [description, setDescription] = useState("");
  const [technologies, setTechnologies] = useState("");
  const [error, setError] = useState("");

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedCode = code.trim().toUpperCase();
    if (!name.trim() || !normalizedCode || !department || !lead) { setError("Complete all required fields."); return; }
    if (data.services.some((service) => service.code.toLowerCase() === normalizedCode || service.name.toLowerCase() === name.trim().toLowerCase())) { setError("A service with this name or code already exists."); return; }
    if (!/^\d+(?:\.\d+)?\s*(?:m|min|h|hr|hrs|d|day|days)$/i.test(slaTarget.trim())) { setError("Response time must use a time unit, such as 30m or 4h."); return; }
    if (!/^\d+(?:\.\d+)?%$/.test(uptime.trim())) { setError("Uptime target must be a percentage, such as 99.9%."); return; }
    setError("");
    const service: ServiceLine = { id: `svc-${crypto.randomUUID()}`, name: name.trim(), code: code.trim().toUpperCase(), department, lead, activeTickets: 0, slaTarget, uptime, description: description.trim(), technologies: technologies.split(",").map((item) => item.trim()).filter(Boolean), status: "Active" };
    addService(service);
    addToast("Service created successfully.", "success");
    navigate(`/services/${encodeURIComponent(service.id)}`);
  };

  return <EntityCreatePage title="Add a service" description="Set up a service line, its owner, and its operational targets." onCancel={() => { if (name || code || description) { if (window.confirm("Discard this service draft?")) navigate("/services"); } else navigate("/services"); }} onSubmit={submit}>
    {error && <p role="alert" className="sm:col-span-2 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
    <FormField label="Service name · required"><input className={formControlClassName} required value={name} onChange={(event) => setName(event.target.value)} /></FormField>
    <FormField label="Service code · required"><input className={formControlClassName} required value={code} onChange={(event) => setCode(event.target.value)} /></FormField>
    <FormField label="Department · required"><select className={formControlClassName} value={department} required onChange={(event) => setDepartment(event.target.value)}>{(data.departments || []).map((item) => <option key={item.id} value={item.name}>{item.name}</option>)}</select></FormField>
    <FormField label="Service lead"><select className={formControlClassName} value={lead} onChange={(event) => setLead(event.target.value)}>{data.employees.map((item) => <option key={item.id}>{item.name}</option>)}</select></FormField>
    <FormField label="Response time SLA · required"><input className={formControlClassName} required value={slaTarget} onChange={(event) => setSlaTarget(event.target.value)} placeholder="e.g. 4h" /><p className="mt-1 text-xs text-slate-500">Time to respond, in minutes, hours, or days.</p></FormField>
    <FormField label="Uptime target · required"><input className={formControlClassName} required value={uptime} onChange={(event) => setUptime(event.target.value)} placeholder="e.g. 99.9%" /><p className="mt-1 text-xs text-slate-500">Availability percentage.</p></FormField>
    <FormField label="Technologies" className="sm:col-span-2"><input className={formControlClassName} value={technologies} onChange={(event) => setTechnologies(event.target.value)} placeholder="Comma-separated technologies" /></FormField>
    <FormField label="Description" className="sm:col-span-2"><textarea className={formControlClassName} rows={3} value={description} onChange={(event) => setDescription(event.target.value)} /></FormField>
  </EntityCreatePage>;
};
