import { useId, type ReactNode } from "react";
import { Button } from "../atoms/Button";
import { Icon } from "../atoms/Icon";

export function FieldHint({ label, children }: { label: string; children: ReactNode }) {
  const hintId = useId();

  return (
    <span className="group relative inline-flex align-middle">
      <Button
        tone="plain"
        type="button"
        aria-label={`About ${label}`}
        aria-describedby={hintId}
        className="inline-flex size-4 items-center justify-center rounded-full text-slate-500 hover:text-slate-800"
      >
        <Icon aria-hidden="true" className="text-[15px]">
          info
        </Icon>
      </Button>
      <span
        id={hintId}
        role="tooltip"
        className="pointer-events-none invisible absolute left-0 top-full z-20 mt-1 w-56 rounded-lg bg-slate-900 px-2.5 py-2 text-left text-xs font-medium leading-relaxed text-white shadow-lg group-hover:visible group-focus-within:visible"
      >
        {children}
      </span>
    </span>
  );
}
