import { Input } from "../atoms/Input";
import { LogoMark } from "../atoms/LogoMark";
import { StaffAvatar } from "../atoms/StaffAvatar";
import { FormField } from "./FormField";

export function LogoPreview({ label, src, variant = "logo" }: {
  label: string;
  src?: string;
  variant?: "logo" | "photo";
}) {
  if (!src) {
    return (
      <FormField label={label} density="compact">
        <Input appearance="compact" readOnly value={`No ${variant} uploaded.`} />
      </FormField>
    );
  }

  return (
    <div className="space-y-1">
      <span className="block text-xs font-semibold text-slate-600">{label}</span>
      <div className="flex size-9 items-center justify-center overflow-hidden rounded-md border border-slate-300">
        {variant === "photo" ? <StaffAvatar key={src} src={src} alt={label} sizeClassName="size-8" /> : <LogoMark src={src} alt={label} />}
      </div>
    </div>
  );
}
