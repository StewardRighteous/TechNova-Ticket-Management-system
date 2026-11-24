import type { ComponentPropsWithRef } from "react";

type FieldAppearance = "standard" | "plain";

const standardField =
  "min-h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-normal text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20 disabled:bg-slate-50 read-only:bg-slate-50";

export function Input({
  appearance = "standard",
  className = "",
  ...props
}: ComponentPropsWithRef<"input"> & { appearance?: FieldAppearance }) {
  return (
    <input {...props} className={`${appearance === "standard" ? standardField : ""} ${className}`} />
  );
}

export function Textarea({
  appearance = "standard",
  className = "",
  ...props
}: ComponentPropsWithRef<"textarea"> & { appearance?: FieldAppearance }) {
  return (
    <textarea {...props} className={`${appearance === "standard" ? standardField : ""} ${className}`} />
  );
}
