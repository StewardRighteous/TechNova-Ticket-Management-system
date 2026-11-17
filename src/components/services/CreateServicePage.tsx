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

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const service: ServiceLine = { id: `svc-${crypto.randomUUID()}`, name: name.trim(), code: code.trim().toUpperCase(), department, lead, activeTickets: 0, slaTarget, uptime, description: description.trim(), technologies: technologies.split(",").map((item) => item.trim()).filter(Boolean), status: "Active" };
    addService(service);
    addToast("Service created successfully.", "success");
    navigate(`/services/${encodeURIComponent(service.id)}`);
  };

  return <EntityCreatePage title="Add a service" description="Set up a service line, its owner, and its operational targets." onCancel={() => navigate("/services")} onSubmit={submit}>
    <FormField label="Service name"><input className={formControlClassName} required value={name} onChange={(event) => setName(event.target.value)} /></FormField>
    <FormField label="Service code"><input className={formControlClassName} required value={code} onChange={(event) => setCode(event.target.value)} /></FormField>
    <FormField label="Department"><select className={formControlClassName} value={department} onChange={(event) => setDepartment(event.target.value)}>{[...new Set([...(data.departments || []).map((item) => item.name), ...data.services.map((item) => item.department)])].map((item) => <option key={item}>{item}</option>)}</select></FormField>
    <FormField label="Service lead"><select className={formControlClassName} value={lead} onChange={(event) => setLead(event.target.value)}>{data.employees.map((item) => <option key={item.id}>{item.name}</option>)}</select></FormField>
    <FormField label="SLA target"><input className={formControlClassName} required value={slaTarget} onChange={(event) => setSlaTarget(event.target.value)} placeholder="e.g. 4h" /></FormField>
    <FormField label="Uptime target"><input className={formControlClassName} required value={uptime} onChange={(event) => setUptime(event.target.value)} placeholder="e.g. 99.9%" /></FormField>
    <FormField label="Technologies" className="sm:col-span-2"><input className={formControlClassName} value={technologies} onChange={(event) => setTechnologies(event.target.value)} placeholder="Comma-separated technologies" /></FormField>
    <FormField label="Description" className="sm:col-span-2"><textarea className={formControlClassName} rows={3} value={description} onChange={(event) => setDescription(event.target.value)} /></FormField>
  </EntityCreatePage>;
};
