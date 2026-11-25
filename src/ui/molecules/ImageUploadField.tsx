import { useEffect, useId, useRef, useState } from "react";
import { Button } from "../atoms/Button";
import { Icon } from "../atoms/Icon";
import { Input } from "../atoms/Input";
import { Label } from "../atoms/Label";
import { FormField } from "./FormField";

export function ImageUploadField({ label, onChange, variant = "input", disabled }: {
  label: string;
  onChange: (image: string) => void;
  variant?: "input" | "button";
  disabled?: boolean;
}) {
  const readerRef = useRef<FileReader | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();
  const [fileName, setFileName] = useState("");

  useEffect(() => () => readerRef.current?.abort(), []);

  const fileInput = (
    <Input
      ref={inputRef}
      id={inputId}
      disabled={disabled}
      type="file"
      accept="image/*"
      className={variant === "button" ? "sr-only" : "file:mr-2 file:font-semibold"}
      tabIndex={variant === "button" ? -1 : undefined}
      onChange={(event) => {
        const input = event.currentTarget;
        const file = input.files?.[0];
        readerRef.current?.abort();
        input.setCustomValidity("");
        if (!file) return;
        if (!file.type.startsWith("image/")) {
          input.setCustomValidity("Choose an image file.");
          input.reportValidity();
          return;
        }
        const reader = new FileReader();
        readerRef.current = reader;
        input.setCustomValidity("Wait for the image to finish loading.");
        reader.onload = () => {
          input.setCustomValidity("");
          setFileName(file.name);
          onChange(String(reader.result));
        };
        reader.onerror = () => {
          input.setCustomValidity("The image could not be read. Choose another file.");
          input.reportValidity();
        };
        reader.readAsDataURL(file);
      }} />
  );

  if (variant === "button") return (
    <div className="min-w-0 space-y-1">
      <Label variant="compact" htmlFor={inputId}>{label}</Label>
      {fileInput}
      <div className="flex min-h-9 items-center gap-2">
        <Button type="button" size="small" disabled={disabled} aria-label={`Upload ${label.toLowerCase()}`} onClick={() => inputRef.current?.click()}>
          <Icon aria-hidden="true" className="text-[16px]">upload</Icon>Upload
        </Button>
        {fileName && <span className="truncate text-xs text-slate-600" title={fileName}>{fileName}</span>}
      </div>
    </div>
  );

  return <FormField label={label}>{fileInput}</FormField>;
}
