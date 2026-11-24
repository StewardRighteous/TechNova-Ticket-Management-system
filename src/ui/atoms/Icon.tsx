import type { ComponentPropsWithRef } from "react";

export function Icon({ className = "", ...props }: ComponentPropsWithRef<"span">) {
  return <span {...props} className={`material-symbols-outlined ${className}`} />;
}
