import { useState } from "react";
import { Button } from "../atoms/Button";
import { Icon } from "../atoms/Icon";
import { Input } from "../atoms/Input";
import { FormField } from "./FormField";

export function CopyableInput({ label, value, type = "text" }: { label: string; value: string; type?: string }) {
  const [copied, setCopied] = useState(false);
  const copyValue = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  };

  return (
    <FormField label={label} density="compact">
      <span className="relative block">
        <Input appearance="compact" type={type} readOnly value={value || "N/A"} className="pr-10" />
        <Button type="button" tone="plain" className="absolute inset-y-1 right-1 inline-flex size-7 items-center justify-center rounded-md text-slate-600 hover:bg-slate-200" aria-label={`${copied ? "Copied" : "Copy"} ${label.toLowerCase()}`} title={`${copied ? "Copied" : "Copy"} ${label.toLowerCase()}`} onClick={copyValue}>
          <Icon aria-hidden="true" className="text-[14px]">{copied ? "check" : "content_copy"}</Icon>
        </Button>
      </span>
    </FormField>
  );
}
