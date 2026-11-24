import type { ComponentPropsWithRef } from "react";

export function Checkbox({ className = "", ...props }: Omit<ComponentPropsWithRef<"input">, "type">) {
  return (
    <input
      {...props}
      type="checkbox"
      className={`accent-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal ${className}`}
    />
  );
}
