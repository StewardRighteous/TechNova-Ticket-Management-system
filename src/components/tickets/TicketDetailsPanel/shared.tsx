import React from "react";
export const fieldClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 shadow-sm outline-none focus:ring-2 focus:ring-indigo-500";
export const Detail: React.FC<{
  label: string;
  value: string;
  wide?: boolean;
}> = ({ label, value, wide }) => (
  <div
    className={`rounded-xl bg-slate-100 p-3 ${wide ? "sm:col-span-3 lg:col-span-4" : ""}`}
  >
    <p className="mb-1 text-[10px] font-bold tracking-wide text-slate-500 uppercase">
      {label}
    </p>
    <p className="text-xs leading-relaxed whitespace-pre-wrap text-slate-800">
      {value}
    </p>
  </div>
);
export const DiagnosticInput: React.FC<{
  label: string;
  value?: string;
  onChange: (value: string) => void;
}> = ({ label, value, onChange }) => (
  <label className="text-xs font-semibold text-slate-600">
    {label}
    <input
      className={`${fieldClass} mt-1`}
      value={value ?? ""}
      onChange={(event) => onChange(event.target.value)}
    />
  </label>
);
