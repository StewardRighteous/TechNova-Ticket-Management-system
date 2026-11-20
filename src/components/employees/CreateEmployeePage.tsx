import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTicketStore } from "../../store/barrel";
import type { Employee, RoleId } from "../../types/barrel";
import { FormField, formControlClassName, SelectDropdown } from "../common/barrel";

export const CreateEmployeePage: React.FC = () => {
  const { data, addEmployee, addToast } = useTicketStore();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [role, setRole] = useState<RoleId>("support_agent");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [teamId, setTeamId] = useState(data.teams?.[0]?.id || "");
  const [departmentId, setDepartmentId] = useState(data.teams?.find((item) => item.id === teamId)?.departmentId || "");
  const [locationId, setLocationId] = useState(data.locations?.[0]?.id || "");
  const [capacityMax, setCapacityMax] = useState(10);
  const [skills, setSkills] = useState("");
  const [error, setError] = useState("");

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const selectedTeam = data.teams?.find((team) => team.id === teamId);
    if (!name.trim() || !email.trim() || !phone.trim()) { setError("Complete all required fields."); return; }
    if (data.employees.some((employee) => employee.email.toLowerCase() === email.trim().toLowerCase())) { setError("An employee with this email already exists."); return; }
    if (selectedTeam && selectedTeam.departmentId !== departmentId) { setError("Choose a department that matches the selected team."); return; }
    if (!Number.isFinite(capacityMax) || capacityMax < 1) { setError("Capacity must be at least one ticket."); return; }
    setError("");
    const roleTitle = data.roles.find((item) => item.id === role)?.name || role;
    const employee: Employee = { id: `emp-${crypto.randomUUID()}`, name: name.trim(), role, roleTitle, email: email.trim(), phone: phone.trim(), avatar: "person", departmentId, teamId, locationId, activeTicketsCount: 0, capacityMax, skills: skills.split(",").map((item) => item.trim()).filter(Boolean), status: "Available" };
    addEmployee(employee);
    addToast("Employee created successfully.", "success");
    navigate(`/employees/${encodeURIComponent(employee.id)}`);
  };

  const cancel = () => { if ((name || email || phone) && !window.confirm("Discard this employee draft?")) return; navigate("/employees"); };
  return <main className="px-5 py-5 sm:px-7 sm:py-6"><form onSubmit={submit} className="space-y-5">
    {error && <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">{error}</p>}
    <div className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
      <FormField label="Full name · required"><input className={formControlClassName} required value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Jamie Lee" /></FormField>
      <FormField label="Role · required"><SelectDropdown label="Role" value={role} onChange={(value) => setRole(value as RoleId)} options={data.roles.map((item) => ({ value: item.id, label: item.name }))} required /></FormField>
      <FormField label="Email · required"><input className={formControlClassName} required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@technova.com" /></FormField>
      <FormField label="Phone · required"><input className={formControlClassName} required type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="e.g. +1 555 0100" /></FormField>
      <FormField label="Department · required"><SelectDropdown label="Department" value={departmentId} onChange={setDepartmentId} options={(data.departments || []).map((item) => ({ value: item.id, label: item.name }))} placeholder="Select a department" required /></FormField>
      <FormField label="Team · required"><SelectDropdown label="Team" value={teamId} onChange={(value) => { setTeamId(value); setDepartmentId(data.teams?.find((team) => team.id === value)?.departmentId || ""); }} options={(data.teams || []).map((item) => ({ value: item.id, label: item.name }))} placeholder="Unassigned" required /></FormField>
      <FormField label="Location"><SelectDropdown label="Location" value={locationId} onChange={setLocationId} options={(data.locations || []).map((item) => ({ value: item.id, label: item.name }))} placeholder="Unassigned" /></FormField>
      <FormField label="Maximum active tickets"><input className={formControlClassName} type="number" min={1} required value={capacityMax} onChange={(event) => setCapacityMax(Number(event.target.value))} /></FormField>
      <FormField label="Skills" className="sm:col-span-2"><input className={formControlClassName} value={skills} onChange={(event) => setSkills(event.target.value)} placeholder="Comma-separated skills" /></FormField>
    </div>
    <footer className="flex items-center justify-between border-t border-slate-200 pt-5"><button type="button" onClick={cancel} className="rounded-lg border border-[#2c3158] px-5 py-2.5 text-sm font-semibold text-[#25294e] hover:bg-slate-50">Cancel</button><button type="submit" className="rounded-lg bg-[#0e858d] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#0b7279]">Create employee</button></footer>
  </form></main>;
};
