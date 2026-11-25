import type { ComponentPropsWithRef } from "react";

type FieldAppearance = "standard" | "compact" | "plain";

const standardField =
  "w-full rounded-md border border-slate-300 bg-white px-3 font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 disabled:bg-slate-50 read-only:bg-slate-50";

const fieldStyles = {
  standard: `${standardField} min-h-10 py-2 text-sm`,
  compact: `${standardField} min-h-9 py-1.5 text-xs`,
  plain: "",
};

export function Input({
  appearance = "standard",
  className = "",
  ...props
}: ComponentPropsWithRef<"input"> & { appearance?: FieldAppearance }) {
  return (
    <input {...props} className={`${fieldStyles[appearance]} ${className}`} />
  );
}

export function Textarea({
  appearance = "standard",
  className = "",
  ...props
}: ComponentPropsWithRef<"textarea"> & { appearance?: FieldAppearance }) {
  return (
    <textarea {...props} className={`${fieldStyles[appearance]} ${className}`} />
  );
}
