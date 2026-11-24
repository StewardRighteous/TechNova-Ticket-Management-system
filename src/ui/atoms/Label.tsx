import type { ComponentPropsWithRef } from "react";

const variants = {
  field: "block space-y-1 text-sm font-semibold text-slate-700",
  compact: "block text-xs font-semibold text-slate-600",
  inline: "inline-flex items-center gap-2 text-sm text-slate-700",
  plain: "",
};

export function Label({
  variant = "field",
  className = "",
  ...props
}: ComponentPropsWithRef<"label"> & { variant?: keyof typeof variants }) {
  return <label {...props} className={`${variants[variant]} ${className}`} />;
}
