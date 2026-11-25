import { useState } from "react";
import type { Company } from "../../types/barrel";
import { DetailEditForm, FormField, ImageUploadField, Input, LogoPreview, SelectDropdown } from "../../ui/barrel";
import { companyTiers } from "./companyTiers";

type CompanyDetails = Pick<Company, "name" | "tier" | "status" | "preferredChannel" | "logo">;

export function CompanyGeneralForm({ company, companies, canEdit, onSave }: {
  company: Company;
  companies: Company[];
  canEdit: boolean;
  onSave: (updates: Partial<Company>) => void;
}) {
  const [changes, setChanges] = useState<Partial<CompanyDetails>>({});
  const draft = { ...company, ...changes };
  const tierOptions = [...new Set([...companyTiers, company.tier, ...companies.map(({ tier }) => tier)].filter(Boolean))]
    .map((value) => ({ value, label: value }));
  const update = (fields: Partial<CompanyDetails>) => setChanges((current) => ({ ...current, ...fields }));
  return (
    <DetailEditForm
      title="Company"
      titleIcon="domain"
      canEdit={canEdit}
      onCancel={() => setChanges({})}
      validate={() => draft.name.trim() ? undefined : "Enter a company name."}
      onSave={() => {
        onSave({ ...changes, name: draft.name.trim() });
        setChanges({});
        return true;
      }}
    >
      {(editing) => <>
        <FormField label="Name" density="compact" className="min-w-0">
          <Input appearance="compact" required value={draft.name} onChange={(event) => update({ name: event.target.value })} />
        </FormField>
        <SelectDropdown showLabel density="compact" label="Account tier" disabled={!editing} options={tierOptions} value={draft.tier} onChange={(tier) => update({ tier })} />
        <SelectDropdown showLabel density="compact" label="Account status" disabled={!editing} options={["Active", "Inactive"].map((value) => ({ value, label: value }))} value={draft.status} onChange={(status) => update({ status: status as Company["status"] })} />
        <SelectDropdown showLabel density="compact" label="Preferred support channel" disabled={!editing} options={["email", "phone", "whatsapp"].map((value) => ({ value, label: value }))} value={draft.preferredChannel} onChange={(preferredChannel) => update({ preferredChannel: preferredChannel as Company["preferredChannel"] })} />
        {editing ? (
          <ImageUploadField label="Company logo" variant="button" onChange={(logo) => update({ logo })} />
        ) : (
          <LogoPreview label="Company logo" src={company.logo} />
        )}
        <FormField label="Internal company ID" density="compact">
          <Input appearance="compact" readOnly value={company.id} />
        </FormField>
      </>}
    </DetailEditForm>
  );
}
