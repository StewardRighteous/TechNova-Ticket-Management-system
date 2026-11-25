import { useState } from "react";
import type { Employee, Team } from "../../types/barrel";
import { DetailEditForm, FormField, ImageUploadField, Input, LogoPreview, SelectDropdown } from "../../ui/barrel";

type EmployeeDetails = Pick<Employee, "name" | "roleTitle" | "email" | "phone" | "avatar" | "status" | "teamId">;

export function EmployeeGeneralForm({ employee, teams, canEdit, canManageEmployment, onSave }: {
  employee: Employee;
  teams: Team[];
  canEdit: boolean;
  canManageEmployment: boolean;
  onSave: (updates: Partial<Employee>) => boolean;
}) {
  const [changes, setChanges] = useState<Partial<EmployeeDetails>>({});
  const draft = { ...employee, ...changes };
  const update = (fields: Partial<EmployeeDetails>) => setChanges((current) => ({ ...current, ...fields }));
  const name = draft.name.trim();
  const email = draft.email.trim();
  const roleTitle = draft.roleTitle.trim();
  const save = () => {
    const saved = onSave({
      ...changes, name, email, phone: draft.phone.trim(),
      ...(canManageEmployment ? { roleTitle, teamId: draft.teamId } : {}),
    });
    if (saved) setChanges({});
    return saved;
  };

  return (
    <DetailEditForm
      title="Employee"
      titleIcon="badge"
      canEdit={canEdit}
      onCancel={() => setChanges({})}
      validate={() => !name || !email || (canManageEmployment && !roleTitle) ? "Complete all required fields." : undefined}
      onSave={save}
    >
      {(editing) => <>
        <FormField label="Full name" density="compact">
          <Input appearance="compact" required value={draft.name} onChange={(event) => update({ name: event.target.value })} />
        </FormField>
        {canManageEmployment && <FormField label="Job title" density="compact">
          <Input appearance="compact" required value={draft.roleTitle} onChange={(event) => update({ roleTitle: event.target.value })} />
        </FormField>}
        <FormField label="Work email" density="compact">
          <Input appearance="compact" required type="email" value={draft.email} onChange={(event) => update({ email: event.target.value })} />
        </FormField>
        <FormField label="Work phone" density="compact">
          <Input appearance="compact" type="tel" value={draft.phone} onChange={(event) => update({ phone: event.target.value })} />
        </FormField>
        <SelectDropdown showLabel density="compact" label="Availability" disabled={!editing} options={[{ value: "Available", label: "Available" }, { value: "Off Shift", label: "Off Shift" }]} value={draft.status === "Off Shift" ? "Off Shift" : "Available"} onChange={(value) => update({ status: value === "Off Shift" ? "Off Shift" : "Available" })} />
        {canManageEmployment && <SelectDropdown showLabel density="compact" label="Team" disabled={!editing} options={teams.map(({ id, name }) => ({ value: id, label: name }))} value={draft.teamId ?? ""} onChange={(teamId) => update({ teamId })} placeholder={editing ? "Select a team" : "N/A"} />}
        {editing ? (
          <ImageUploadField label="Profile photo" variant="button" onChange={(avatar) => update({ avatar })} />
        ) : (
          <LogoPreview label="Profile photo" variant="photo" src={employee.avatar} />
        )}
      </>}
    </DetailEditForm>
  );
}
