import type { ComponentPropsWithRef, ReactNode } from "react";
import { Checkbox } from "../atoms/Checkbox";
import { Label } from "../atoms/Label";

export function CheckboxField({
  label,
  className,
  ...props
}: ComponentPropsWithRef<typeof Checkbox> & {
  label: ReactNode;
  className?: string;
}) {
  return (
    <Label variant="inline" className={className}>
      <Checkbox {...props} />
      {label}
    </Label>
  );
}
