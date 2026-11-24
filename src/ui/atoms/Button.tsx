import type { ComponentPropsWithRef } from "react";

const tones = {
  primary: "border-transparent bg-teal-600 text-white hover:bg-teal-700",
  secondary: "border-slate-300 bg-white text-slate-700 hover:bg-slate-50",
  danger: "border-transparent bg-red-700 text-white hover:bg-red-800",
  ghost: "border-transparent text-slate-700 hover:bg-slate-100",
  inverse: "border-white/30 text-white hover:bg-white/10",
  inverseDanger: "border-rose-300/70 bg-fuchsia-950/60 text-rose-100 hover:bg-fuchsia-900/75",
};

const sizes = {
  small: "px-3 py-1.5 text-xs",
  compact: "px-3.5 py-2 text-sm",
  medium: "px-5 py-2.5 text-sm",
  icon: "h-9 w-9",
};

type ButtonProps = ComponentPropsWithRef<"button"> & {
  tone?: keyof typeof tones | "plain";
  size?: keyof typeof sizes;
};

export function Button({
  tone = "secondary",
  size = "medium",
  type,
  className = "",
  ...props
}: ButtonProps) {
  const appearance =
    tone === "plain"
      ? ""
      : `inline-flex items-center justify-center gap-1.5 rounded-lg border font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${tones[tone]} ${sizes[size]}`;
  return (
    <button
      {...props}
      type={type}
      className={`focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal ${appearance} ${className}`}
    />
  );
}
