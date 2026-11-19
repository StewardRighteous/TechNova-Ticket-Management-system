import React from "react";

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({ label, children, className }) => (
  <label className={`block space-y-1.5 text-sm font-semibold text-slate-700 ${className || ""}`}>
    <span>{label}</span>
    {children}
  </label>
);

export const formControlClassName =
  "w-full rounded-lg border-2 border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500";
