import { useId, type ReactNode } from "react";
import { Input, Textarea } from "../atoms/Input";
import { Label } from "../atoms/Label";

interface ReadOnlyFieldProps {
  label: string;
  value: string;
  multiline?: boolean;
  minRows?: 2 | 4;
  className?: string;
  labelAction?: ReactNode;
}

export function ReadOnlyField({ label, value, multiline, minRows = 2, className = "", labelAction }: ReadOnlyFieldProps) {
  const id = useId();
  const fieldProps = { id, value, readOnly: true, appearance: "plain" } as const;
  const fieldClassName = "block min-w-0 flex-1 rounded-md bg-transparent px-3 py-2 text-sm leading-5 text-slate-900 outline-none";
  return (
    <div className={`flex flex-col ${className}`}>
      <div className="flex items-center justify-between gap-1">
        <Label htmlFor={id} variant="plain" className="block text-xs font-semibold text-slate-500 uppercase">{label}</Label>
        {labelAction}
      </div>
      <div className="mt-1 flex flex-1 rounded-md border border-slate-300 bg-slate-50 focus-within:border-teal-600 focus-within:ring-2 focus-within:ring-teal-600/20">
        {multiline ? (
          <Textarea
            {...fieldProps}
            className={`${fieldClassName} field-sizing-content resize-none ${minRows === 4 ? "min-h-24" : "min-h-14"}`}
            rows={minRows}
          />
        ) : (
          <Input {...fieldProps} className={fieldClassName} />
        )}
      </div>
    </div>
  );
}
