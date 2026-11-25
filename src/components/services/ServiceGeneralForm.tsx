import { useState } from "react";
import type { Department, Employee, ServiceLine } from "../../types/barrel";
import { DetailEditForm, FormField, ImageUploadField, Input, LogoPreview, SelectDropdown } from "../../ui/barrel";

type ServiceDetails = Pick<ServiceLine, "name" | "code" | "logo" | "department" | "lead" | "leadEmployeeId">;

export function ServiceGeneralForm({ service, services, departments, employees, canEdit, onSave }: {
  service: ServiceLine;
  services: ServiceLine[];
  departments: Department[];
  employees: Employee[];
  canEdit: boolean;
  onSave: (updates: Partial<ServiceLine>) => void;
}) {
  const [changes, setChanges] = useState<Partial<ServiceDetails>>({});
  const draft = { ...service, ...changes };
  const update = (fields: Partial<ServiceDetails>) => setChanges((current) => ({ ...current, ...fields }));
  const name = draft.name.trim();
  const code = draft.code.trim().toUpperCase();
  const validate = () => {
    if (!name || !code) return "Enter a service name and code.";
    const duplicate = services.some((item) => item.id !== service.id &&
      (item.code.toLowerCase() === code.toLowerCase() || item.name.toLowerCase() === name.toLowerCase()));
    return duplicate ? "A service with this name or code already exists." : undefined;
  };
  const departmentOptions = [...new Set([draft.department, ...departments.map(({ name }) => name)].filter(Boolean))]
    .map((value) => ({ value, label: value }));

  return (
    <DetailEditForm
      title="Service"
      titleIcon="layers"
      canEdit={canEdit}
      onCancel={() => setChanges({})}
      validate={validate}
      onSave={() => {
        onSave({ ...changes, name, code });
        setChanges({});
        return true;
      }}
    >
      {(editing) => <>
        <FormField label="Name" density="compact">
          <Input appearance="compact" required value={draft.name} onChange={(event) => update({ name: event.target.value })} />
        </FormField>
        <FormField label="Code" density="compact">
          <Input appearance="compact" required value={draft.code} onChange={(event) => update({ code: event.target.value })} />
        </FormField>
        <SelectDropdown showLabel density="compact" label="Owning department" disabled={!editing} options={departmentOptions} value={draft.department} onChange={(department) => update({ department })} />
        <SelectDropdown showLabel density="compact" label="Lead" disabled={!editing} options={employees.map(({ id, name }) => ({ value: id, label: name }))} value={draft.leadEmployeeId ?? ""} placeholder={draft.lead || "Select a lead"} onChange={(leadEmployeeId) => {
          const employee = employees.find(({ id }) => id === leadEmployeeId);
          if (employee) update({ lead: employee.name, leadEmployeeId });
        }} />
        {editing ? (
          <ImageUploadField label="Logo" variant="button" onChange={(logo) => update({ logo })} />
        ) : (
          <LogoPreview label="Logo" src={service.logo} />
        )}
      </>}
    </DetailEditForm>
  );
}
