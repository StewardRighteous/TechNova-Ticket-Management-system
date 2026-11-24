import type { ComponentPropsWithRef } from "react";

const variants = {
  page: "text-xl font-bold tracking-tight text-slate-900 sm:text-2xl",
  notice: "text-lg font-semibold text-slate-900",
  dialog: "text-lg font-bold text-slate-900",
  region: "text-base font-bold text-slate-900",
  subsection: "text-sm font-bold text-slate-900",
  eyebrow: "text-xs font-bold uppercase tracking-wide text-slate-500",
  inverse: "min-w-0 truncate text-lg font-bold text-white sm:text-xl",
  plain: "",
};

type Level = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";

export function Heading({
  as: Tag = "h2",
  variant = "region",
  className = "",
  ...props
}: ComponentPropsWithRef<"h2"> & {
  as?: Level;
  variant?: keyof typeof variants;
}) {
  return <Tag {...props} className={`${variants[variant]} ${className}`} />;
}
