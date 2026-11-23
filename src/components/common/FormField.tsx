import React from "react";

interface FormFieldProps {
  label: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({ label, children, className }) => (
  <label className={`block space-y-1.5 text-[15px] font-semibold text-[#384b68] ${className || ""}`}>
    <span>{label}</span>
    {children}
  </label>
);

export const formControlClassName =
  "min-h-11 w-full rounded-lg border-[1.5px] border-[#c4d2e5] bg-white px-3.5 py-2 text-[15px] font-normal text-[#1f2041] outline-none transition placeholder:text-[#91a4c0] focus:border-[#2c3158] focus:ring-2 focus:ring-[#dfe4f0]";
