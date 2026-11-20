import React from "react";
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
  <label className="text-xs font-semibold text-slate-600">
    {label}
    <input
      className={`${readonly ? readOnlyFieldClass : fieldClass} mt-1`}
      value={value ?? ""}
      onChange={(event) => onChange(event.target.value)}
      readOnly={readonly}
    />
  </label>
);

export const Input: React.FC<{
  label: string;
  value?: string;
  set: (value: string) => void;
  wide?: boolean;
  readonly: boolean;
}> = ({ label, value, set, wide, readonly }) => (
  <label
    className={`text-xs font-semibold text-slate-600 ${wide ? "col-span-2" : ""}`}
  >
    {label}
    <input
      className={`${readonly ? readOnlyFieldClass : fieldClass} mt-1`}
      value={value ?? ""}
      onChange={(e) => set(e.target.value)}
      readOnly={readonly}
    />
  </label>
);

export const TextArea: React.FC<{
  label: string;
  value?: string;
  set: (value: string) => void;
  wide?: boolean;
  readonly: boolean;
}> = ({ label, value, set, wide, readonly }) => (
  <label
    className={`text-xs font-semibold text-slate-600 ${wide ? "md:col-span-2" : ""}`}
  >
    {label}
    <textarea
      className={`${readonly ? readOnlyFieldClass : fieldClass} mt-1`}
      rows={readonly ? Math.min(8, Math.max(3, (value ?? "").split(/\\n|\n/).length)) : 4}
      style={readonly ? { minHeight: `${Math.min(12, Math.max(3, (value ?? "").split(/\\n|\n/).length)) * 1.5}rem` } : undefined}
      value={readonly ? (value ?? "").replace(/\\n/g, "\n") : value ?? ""}
      onChange={(e) => set(e.target.value)}
      readOnly={readonly}
    />
  </label>
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
      <label className="text-xs font-semibold text-slate-600">
        {label}
        <input
          className={`${readOnlyFieldClass} mt-1 capitalize`}
          value={displayValue.replace(/\\n/g, "\n")}
          readOnly
        />
      </label>
    );
  }

  return (
    <label className="text-xs font-semibold text-slate-600">
      {label}
      <select
        className={`${fieldClass} mt-1`}
        value={value}
        onChange={(e) => set(e.target.value)}
      >
        {options.map(([key, text]) => (
          <option key={key} value={key}>
            {text}
          </option>
        ))}
      </select>
    </label>
  );
};

export const Read: React.FC<{ label: string; value: string }> = ({
  label,
  value,
}) => (
  <label className="text-xs font-semibold text-slate-600">
    {label}
    <input
      className={`${readOnlyFieldClass} mt-1 bg-slate-50`}
      value={value.replace(/\\n/g, "\n")}
      readOnly
    />
  </label>
);

export const ConfirmationDialog: React.FC<{
  action: "save" | "cancel";
  onConfirm: () => void;
  onClose: () => void;
}> = ({ action, onConfirm, onClose }) => {
  const isSave = action === "save";
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/35 p-4"
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="ticket-confirm-title"
        className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-4 shadow-xl"
      >
        <h3
          id="ticket-confirm-title"
          className="text-base font-bold text-slate-900"
        >
          {isSave ? "Save ticket changes?" : "Discard ticket changes?"}
        </h3>
        <p className="mt-1.5 text-sm text-slate-600">
          {isSave
            ? "Your changes will be applied to this ticket."
            : "Your unsaved changes will be lost."}
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <button
            autoFocus
            onClick={onClose}
            className="rounded-md px-3 py-1.5 text-sm font-semibold text-slate-600 hover:bg-slate-100"
          >
            Keep editing
          </button>
          <button
            onClick={onConfirm}
            className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            {isSave ? "Save changes" : "Discard changes"}
          </button>
        </div>
      </div>
    </div>
  );
};
