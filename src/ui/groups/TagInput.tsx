import { useRef } from "react";
import { Button } from "../atoms/Button";
import { Input } from "../atoms/Input";

interface TagInputProps {
  tags: string[];
  value: string;
  onChange: (value: string) => void;
  onAdd: (value: string) => void;
  onRemove: (value: string) => void;
  label: string;
  placeholder?: string;
}

export function TagInput({ tags, value, onChange, onAdd, onRemove, label, placeholder }: TagInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div className="flex min-h-10 flex-wrap items-center gap-2 rounded-md border border-slate-300 bg-white px-2.5 py-1.5 focus-within:border-teal-600 focus-within:ring-2 focus-within:ring-teal-600/20">
      {tags.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1.5 rounded-md bg-violet-50 px-2 py-1 text-xs font-medium text-violet-800"
        >
          {tag}
          <Button
            type="button"
            tone="plain"
            aria-label={`Remove ${tag}`}
            onClick={() => {
              onRemove(tag);
              inputRef.current?.focus();
            }}
          >
            ×
          </Button>
        </span>
      ))}
      <Input
        appearance="plain"
        ref={inputRef}
        aria-label={label}
        className="min-w-32 flex-1 px-1 text-sm outline-none"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === ",") {
            event.preventDefault();
            onAdd(value);
          }
          const lastTag = tags.at(-1);
          if (event.key === "Backspace" && !value && lastTag) onRemove(lastTag);
        }}
        onBlur={() => {
          if (value) onAdd(value);
        }}
        placeholder={placeholder}
      />
    </div>
  );
}
