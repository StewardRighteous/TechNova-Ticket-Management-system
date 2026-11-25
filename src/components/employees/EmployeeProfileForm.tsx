import { useState, type ReactNode } from "react";
import type { Department, Employee, Location, RoleId, ServiceLine, Team } from "../../types/barrel";
import { ComboboxFilter, CopyableInput, DetailEditForm, FormField, Input, SelectDropdown } from "../../ui/barrel";

interface EmployeeProfileFormProps {
  employee: Employee;
  departments: Department[];
  teams: Team[];
  locations: Location[];
  roles: { id: RoleId; name: string }[];
  services: ServiceLine[];
  canEdit: boolean;
  canManageEmployment: boolean;
  profileOnly: boolean;
  onSave: (updates: Partial<Employee>) => boolean;
}

type ProfileDraft = Omit<Employee, "skills"> & { skills: string };

function EmployeeProfileSection({ title, icon, employee, canEdit, onSave, children }: {
  title: string;
  icon: string;
  employee: Employee;
  canEdit: boolean;
  onSave: EmployeeProfileFormProps["onSave"];
  children: (draft: ProfileDraft, update: (fields: Partial<ProfileDraft>) => void, editing: boolean) => ReactNode;
}) {
  const [changes, setChanges] = useState<Partial<ProfileDraft>>({});
  const draft = { ...employee, skills: employee.skills.join(", "), ...changes };
  const update = (fields: Partial<ProfileDraft>) => setChanges((current) => ({ ...current, ...fields }));
  const save = () => {
    if (!Object.keys(changes).length) return true;

    const { skills, ...fields } = changes;
    const trimmedFields = Object.fromEntries(
      Object.entries(fields).map(([key, value]) => [key, typeof value === "string" ? value.trim() : value]),
    );
    const saved = onSave({
      ...trimmedFields,
      ...(skills === undefined ? {} : { skills: [...new Set(skills.split(",").map((skill) => skill.trim()).filter(Boolean))] }),
    });
    if (saved) setChanges({});
    return saved;
  };

  return (
    <DetailEditForm title={title} titleIcon={icon} canEdit={canEdit} layout="section" onCancel={() => setChanges({})} onSave={save}>
      {(editing) => children(draft, update, editing)}
    </DetailEditForm>
  );
}

function field(label: string, value: string, onChange?: (value: string) => void, type = "text", copyable = false) {
  if (!onChange && copyable) return <CopyableInput label={label} value={value} type={type} />;
  return (
    <FormField label={label} density="compact">
      <Input appearance="compact" type={onChange || value ? type : "text"} readOnly={!onChange} value={onChange ? value : value || "N/A"} onChange={onChange && ((event) => onChange(event.target.value))} />
    </FormField>
  );
}

export function EmployeeProfileForm({ employee, departments, teams, locations, roles, services, canEdit, canManageEmployment, profileOnly, onSave }: EmployeeProfileFormProps) {
  const sectionProps = { employee, canEdit, onSave };
  const eligibleServices = (employee.eligibleServiceIds ?? []).map((id) => services.find((service) => service.id === id)?.name ?? id);

  return (
    <div className="space-y-3">
      <EmployeeProfileSection {...sectionProps} title="Personal details" icon="person">
        {(draft, update, editing) => <>
          {field("Date of birth", draft.dateOfBirth ?? "", editing ? (dateOfBirth) => update({ dateOfBirth }) : undefined, "date")}
          {field("Gender", draft.gender ?? "", editing ? (gender) => update({ gender }) : undefined)}
          {field("Personal address", draft.personalAddress ?? "", editing ? (personalAddress) => update({ personalAddress }) : undefined, "text", true)}
        </>}
      </EmployeeProfileSection>
      <EmployeeProfileSection {...sectionProps} canEdit={canEdit && canManageEmployment} title="Employment" icon="work">
        {(draft, update, editing) => <>
          {editing ? <>
            <SelectDropdown showLabel density="compact" label="Department" options={departments.map(({ id, name }) => ({ value: id, label: name }))} value={draft.departmentId ?? ""} onChange={(departmentId) => update({ departmentId })} placeholder="Select a department" />
            <SelectDropdown showLabel density="compact" label="Team" options={teams.map(({ id, name }) => ({ value: id, label: name }))} value={draft.teamId ?? ""} onChange={(teamId) => update({ teamId })} placeholder="Select a team" />
          </> : <>
            {field("Department", departments.find(({ id }) => id === employee.departmentId)?.name ?? "Not assigned")}
            {!profileOnly && field("Team", teams.find(({ id }) => id === employee.teamId)?.name ?? "Not assigned")}
          </>}
          {field("Manager", draft.managerName ?? "", editing ? (managerName) => update({ managerName }) : undefined)}
          {editing
            ? <SelectDropdown showLabel density="compact" label="Support role" options={roles.map(({ id, name }) => ({ value: id, label: name }))} value={draft.role} onChange={(role) => update({ role: role as RoleId })} />
            : field("Support role", roles.find((role) => role.id === employee.role)?.name ?? employee.role.replaceAll("_", " "))}
          {editing
            ? <SelectDropdown showLabel density="compact" label="Work location" options={locations.map(({ id, name }) => ({ value: id, label: name }))} value={draft.locationId ?? ""} onChange={(locationId) => update({ locationId })} placeholder="Select a location" />
            : field("Work location", locations.find(({ id }) => id === employee.locationId)?.name ?? "Remote / distributed", undefined, "text", true)}
          {field("Hire date", draft.hireDate ?? "", editing ? (hireDate) => update({ hireDate }) : undefined, "date")}
          {field("Employment type", draft.employmentType ?? "", editing ? (employmentType) => update({ employmentType }) : undefined)}
        </>}
      </EmployeeProfileSection>
      <EmployeeProfileSection {...sectionProps} title="Support and skills" icon="support_agent">
        {(draft, update, editing) => {
          const manage = editing && canManageEmployment;
          return <>
            {field("Time zone", draft.timeZone ?? "", editing ? (timeZone) => update({ timeZone }) : undefined)}
            {field("Shift or on-call schedule", draft.supportSchedule ?? "", manage ? (supportSchedule) => update({ supportSchedule }) : undefined)}
            {manage
              ? <ComboboxFilter label="Eligible services" options={services.map(({ id, name }) => ({ value: id, label: name }))} selectedValues={draft.eligibleServiceIds ?? []} onChange={(eligibleServiceIds) => update({ eligibleServiceIds })} placeholder="Any service" />
              : !profileOnly && field("Eligible services", eligibleServices.join(", ") || "Any service")}
            <div className="col-span-full">
              {field("Skills", draft.skills, editing ? (skills) => update({ skills }) : undefined, "text", true)}
            </div>
          </>;
        }}
      </EmployeeProfileSection>
      <EmployeeProfileSection {...sectionProps} title="Emergency contact" icon="contact_phone">
        {(draft, update, editing) => <>
          {field("Contact name", draft.emergencyContactName ?? "", editing ? (emergencyContactName) => update({ emergencyContactName }) : undefined, "text", true)}
          {field("Contact phone", draft.emergencyContactPhone ?? "", editing ? (emergencyContactPhone) => update({ emergencyContactPhone }) : undefined, "tel", true)}
          {field("Contact email", draft.emergencyContactEmail ?? "", editing ? (emergencyContactEmail) => update({ emergencyContactEmail }) : undefined, "email", true)}
        </>}
      </EmployeeProfileSection>
      <EmployeeProfileSection {...sectionProps} title="Bank and tax details" icon="account_balance">
        {(draft, update, editing) => <>
          {field("Bank name", draft.bankName ?? "", editing ? (bankName) => update({ bankName }) : undefined, "text", true)}
          {field("Account holder", draft.accountHolderName ?? "", editing ? (accountHolderName) => update({ accountHolderName }) : undefined, "text", true)}
          {field("Account number", draft.accountNumber ?? "", editing ? (accountNumber) => update({ accountNumber }) : undefined, "text", true)}
          {field("Routing number", draft.routingNumber ?? "", editing ? (routingNumber) => update({ routingNumber }) : undefined, "text", true)}
          {field("Tax ID", draft.taxId ?? "", editing ? (taxId) => update({ taxId }) : undefined, "text", true)}
        </>}
      </EmployeeProfileSection>
    </div>
  );
}
