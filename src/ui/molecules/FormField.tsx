import { Label } from "../atoms/Label";
import React from "react";

interface FormFieldProps {
  label: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  required?: boolean;
  density?: "standard" | "compact";
}

export const FormField: React.FC<FormFieldProps> = ({ label, children, className = "", required, density = "standard" }) => (
  <Label variant={density === "compact" ? "compact" : "field"} className={className}>
    <span className={density === "compact" ? "mb-1 block" : undefined}>
      {label}
      {required && (
        <span aria-hidden="true" className="ml-1 text-red-600">
          *
        </span>
      )}
    </span>
    {children}
  </Label>
);
