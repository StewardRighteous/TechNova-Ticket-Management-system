import type { ComponentPropsWithRef } from "react";

export function ExternalLink({ className = "", ...props }: ComponentPropsWithRef<"a">) {
  return (
    <a
      {...props}
      className={`focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-teal ${className}`}
    />
  );
}
