import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTicketStore } from "../../store/barrel";
import type { ServiceLine } from "../../types/barrel";
import { StepAction, ConfirmationDialog, TagInput, FormActions, Button, Input, Textarea, FormField, SelectDropdown } from "../../ui/barrel";
import { durationMinutes } from "../../utils/supportPolicy";

export const CreateServicePage: React.FC = () => {
  const { data, addService, addToast } = useTicketStore();
  const navigate = useNavigate();
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [department, setDepartment] = useState(data.departments?.[0]?.name || "Support");
  const [leadEmployeeId, setLeadEmployeeId] = useState(data.employees[0]?.id || "");
  const lead = data.employees.find((employee) => employee.id === leadEmployeeId)?.name;
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
    if (currentStep === 2 && (!durationMinutes(slaTarget) || !/^\d+(?:\.\d+)?$/.test(uptimeValue.trim()) || Number(uptimeValue) <= 0 || Number(uptimeValue) > 100)) { setError("Enter valid response time and uptime targets to continue."); return false; }
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
    if (step === 1) {
      if (validateStep(1)) setStep(2);
      return;
    }
    const normalizedCode = code.trim().toUpperCase();
    if (!name.trim() || !normalizedCode || !department || !lead) { setError("Complete all required fields."); return; }
    if (data.services.some((service) => service.code.toLowerCase() === normalizedCode || service.name.toLowerCase() === name.trim().toLowerCase())) { setError("A service with this name or code already exists."); return; }
    if (!durationMinutes(slaTarget)) { setError("Enter a response time between one minute and one year."); return; }
    if (!/^\d+(?:\.\d+)?$/.test(uptimeValue.trim()) || Number(uptimeValue) <= 0 || Number(uptimeValue) > 100) { setError("Uptime target must be between 0 and 100%."); return; }
    setError("");
    const service: ServiceLine = { id: `svc-${crypto.randomUUID()}`, name: name.trim(), code: normalizedCode, department, lead, leadEmployeeId, activeTickets: 0, slaTarget, uptime: "", uptimeTarget: uptime, description: description.trim(), technologies, status: "Operational" };
    addService(service);
    addToast("Service created successfully.", "success");
    navigate(`/services/${encodeURIComponent(service.id)}`);
  };

  const cancel = () => {
    if (name || code || description || technologies.length) setConfirmDiscard(true);
    else navigate("/services");
  };

  return <main className="px-5 py-5 sm:px-7 sm:py-6"><form onSubmit={submit} className="space-y-5">
      {error && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
      {step === 1 && <div className="space-y-4">
      <div className="service-create-grid">
        <FormField label="Service name" required><Input required value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Customer Portal" /></FormField>
        <FormField label="Service code" required><Input required value={code} onChange={(event) => setCode(event.target.value)} placeholder="e.g. SRV-001" /></FormField>
      <FormField label="Department" required><SelectDropdown label="Department" value={department} onChange={setDepartment} options={(data.departments || []).map((item) => ({ value: item.name, label: item.name }))} required /></FormField>
        <FormField label="Service lead" required><SelectDropdown label="Service lead" value={leadEmployeeId} onChange={setLeadEmployeeId} options={data.employees.map((item) => ({ value: item.id, label: item.name }))} required /></FormField>
      </div>
      </div>}
      {step === 2 && <section className="service-create-targets">
        <div className="mb-3 flex justify-end"><span className="rounded-lg bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-800">Target uptime {uptime}</span></div>
        <div className="service-create-grid service-create-target-grid">
          <FormField label="Response time SLA" required><div className="flex flex-wrap items-center gap-2"><Input className="max-w-24" aria-label="Response time" type="number" min="1" step="any" required value={slaValue} onChange={(event) => setSlaValue(event.target.value)} /><SelectDropdown label="Response time unit" value={slaUnit} onChange={setSlaUnit} options={["Minutes", "Hours", "Days"].map((item) => ({ value: item, label: item }))} /><span className="text-xs font-normal text-slate-500">e.g. 4 Hours</span></div></FormField>
          <FormField label="Uptime target" required><div className="flex flex-wrap items-center gap-2"><Input className="max-w-24" aria-label="Uptime target" type="number" min="0.1" max="100" step="0.1" required value={uptimeValue} onChange={(event) => setUptimeValue(event.target.value)} /><span className="text-sm text-slate-600">%</span><span>e.g. 99.9%</span></div></FormField>
          <FormField label="Technologies" className="service-create-wide"><TagInput
            tags={technologies}
            value={technologyInput}
            onChange={setTechnologyInput}
            onAdd={addTechnology}
            onRemove={(value) => setTechnologies((items) => items.filter((item) => item !== value))}
            label="Technologies"
            placeholder="Add technology..."
          /></FormField>
          <FormField label="Description" className="service-create-wide"><Textarea rows={3} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Briefly describe the service, its purpose, and key functionality." /></FormField>
        </div>
      </section>}
      <FormActions><Button cancel={step === 1} type="button" onClick={step === 1 ? cancel : () => { setError(""); setStep(1); }}>{step === 1 ? "Cancel" : "Back"}</Button><StepAction continueLabel="Create service" showContinueArrow={false} onContinue={step === 1 ? () => { if (validateStep(1)) setStep(2); } : undefined} submitLabel="Create service" /></FormActions>
    </form>
    {confirmDiscard && <ConfirmationDialog
        title="Discard this service draft?"
        description="Your unsaved changes will be lost."
        cancelLabel="Keep editing"
        confirmLabel="Discard draft"
        onCancel={() => setConfirmDiscard(false)}
        onConfirm={() => navigate("/services")}
        danger
      />}
  </main>;
};
