import { ConfirmationDialog, Input, Label, Textarea } from "../../../ui/barrel";
import React from "react";
import { SelectDropdown } from "../../../ui/groups/SelectDropdown";

export const fieldClass =
  "w-full rounded-lg border border-indigo-500 bg-white px-3 py-2 text-xs text-slate-800 shadow-sm outline-none focus:ring-2 focus:ring-indigo-500";
export const readOnlyFieldClass =
  "w-full rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 outline-none";

export const DiagnosticInput: React.FC<{
  label: string;
  value?: string;
  readonly: boolean;
  onChange: (value: string) => void;
}> = ({ label, value, onChange, readonly }) => (
  <Label variant="plain" className="text-xs font-semibold text-slate-600">
    {label}
    <Input appearance="plain"
      className={`${readonly ? readOnlyFieldClass : fieldClass} mt-1`}
      value={value ?? ""}
      onChange={(event) => onChange(event.target.value)}
      readOnly={readonly}
    />
  </Label>
);

export const TicketDetailField: React.FC<{
  label: string;
  value?: string;
  set: (value: string) => void;
  type?: "text" | "datetime-local";
  wide?: boolean;
  readonly: boolean;
}> = ({ label, value, set, wide, readonly, type = "text" }) => (
  <Label variant="plain"
    className={`text-xs font-semibold text-slate-600 ${wide ? "col-span-2" : ""}`}
  >
    {label}
    <Input appearance="plain"
      type={type}
      step={type === "datetime-local" ? "any" : undefined}
      className={`${readonly ? readOnlyFieldClass : fieldClass} mt-1`}
      value={value ?? ""}
      onChange={(e) => set(e.target.value)}
      readOnly={readonly}
    />
  </Label>
);

export const TextArea: React.FC<{
  label: string;
  value?: string;
  set: (value: string) => void;
  wide?: boolean;
  readonly: boolean;
}> = ({ label, value, set, wide, readonly }) => (
  <Label variant="plain"
    className={`text-xs font-semibold text-slate-600 ${wide ? "md:col-span-2" : ""}`}
  >
    {label}
    <Textarea appearance="plain"
      className={`${readonly ? readOnlyFieldClass : fieldClass} mt-1`}
      rows={readonly ? Math.min(8, Math.max(3, (value ?? "").split(/\\n|\n/).length)) : 4}
      style={readonly ? { minHeight: `${Math.min(12, Math.max(3, (value ?? "").split(/\\n|\n/).length)) * 1.5}rem` } : undefined}
      value={readonly ? (value ?? "").replace(/\\n/g, "\n") : value ?? ""}
      onChange={(e) => set(e.target.value)}
      readOnly={readonly}
    />
  </Label>
);
export const Select: React.FC<{
  label: string;
  value: string;
  options: string[][];
  readonly: boolean;
  set: (value: string) => void;
}> = ({ label, value, options, set, readonly }) => {
  if (readonly === true) {
    const displayValue = options.find(([key]) => key === value)?.[1] ?? value;

    return (
      <Label variant="plain" className="text-xs font-semibold text-slate-600">
        {label}
        <Input appearance="plain"
          className={`${readOnlyFieldClass} mt-1 capitalize`}
          value={displayValue.replace(/\\n/g, "\n")}
          readOnly
        />
      </Label>
    );
  }

  return <SelectDropdown label={label} value={value} onChange={set} options={options.map(([key, text]) => ({ value: key, label: text }))} className="mt-1" />;
};

export const Read: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <Label variant="plain" className="text-xs font-semibold text-slate-600">
    {label}
    <Input appearance="plain"
      className={`${readOnlyFieldClass} mt-1 bg-slate-50`}
      value={value.replace(/\\n/g, "\n")}
      readOnly
    />
  </Label>
);

export const TicketEditConfirmation: React.FC<{
  action: "save" | "cancel";
  onConfirm: () => void;
  onClose: () => void;
}> = ({ action, onConfirm, onClose }) => {
  const isSave = action === "save";
  return <ConfirmationDialog
    title={isSave ? "Save ticket changes?" : "Discard ticket changes?"}
    description={isSave ? "Your changes will be applied to this ticket." : "Your unsaved changes will be lost."}
    cancelLabel="Keep editing"
    confirmLabel={isSave ? "Save changes" : "Discard changes"}
    onCancel={onClose}
    onConfirm={onConfirm}
    danger={!isSave}
  />;
};
