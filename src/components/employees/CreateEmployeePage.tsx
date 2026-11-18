import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTicketStore } from "../../store/barrel";
import type { Employee, RoleId } from "../../types/barrel";
import { EntityCreatePage, FormField, formControlClassName } from "../common/barrel";

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

  return <EntityCreatePage title="Add an employee" description="Create an employee profile and assign their role, team, and capacity." onCancel={() => { if (name || email || phone) { if (window.confirm("Discard this employee draft?")) navigate("/employees"); } else navigate("/employees"); }} onSubmit={submit}>
    {error && <p role="alert" className="sm:col-span-2 rounded-lg bg-rose-50 p-3 text-sm text-rose-700">{error}</p>}
    <FormField label="Full name"><input className={formControlClassName} required value={name} onChange={(event) => setName(event.target.value)} /></FormField>
    <FormField label="Role"><select className={formControlClassName} value={role} onChange={(event) => setRole(event.target.value as RoleId)}>{data.roles.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></FormField>
    <FormField label="Email"><input className={formControlClassName} required type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></FormField>
    <FormField label="Phone"><input className={formControlClassName} required type="tel" value={phone} onChange={(event) => setPhone(event.target.value)} /></FormField>
    <FormField label="Department · required"><select className={formControlClassName} value={departmentId} onChange={(event) => setDepartmentId(event.target.value)}><option value="">Select a department</option>{(data.departments || []).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></FormField>
    <FormField label="Team · required"><select className={formControlClassName} value={teamId} required onChange={(event) => { setTeamId(event.target.value); setDepartmentId(data.teams?.find((team) => team.id === event.target.value)?.departmentId || ""); }}><option value="">Unassigned</option>{(data.teams || []).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select><p className="mt-1 text-xs text-slate-500">Selecting a team sets its department.</p></FormField>
    <FormField label="Location"><select className={formControlClassName} value={locationId} onChange={(event) => setLocationId(event.target.value)}><option value="">Unassigned</option>{(data.locations || []).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></FormField>
    <FormField label="Maximum active tickets"><input className={formControlClassName} type="number" min={1} required value={capacityMax} onChange={(event) => setCapacityMax(Number(event.target.value))} /></FormField>
    <FormField label="Skills" className="sm:col-span-2"><input className={formControlClassName} value={skills} onChange={(event) => setSkills(event.target.value)} placeholder="Comma-separated skills" /></FormField>
  </EntityCreatePage>;
};
