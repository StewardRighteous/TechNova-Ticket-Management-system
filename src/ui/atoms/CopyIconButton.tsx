import { Button } from "./Button";
import { Icon } from "./Icon";

export function CopyIconButton({ label, onCopy, variant = "icon" }: { label: string; onCopy?: () => void; variant?: "icon" | "labeled" }) {
  const actionLabel = `Copy ${label.toLowerCase()}`;
  const labeled = variant === "labeled";
  return (
    <Button
      type="button"
      tone="plain"
      className={`inline-flex shrink-0 items-center justify-center rounded-md text-slate-600 disabled:opacity-40 ${labeled ? "h-6 gap-1 border border-slate-300 px-2 text-xs font-semibold enabled:hover:bg-slate-100" : "size-7 enabled:hover:bg-slate-200"}`}
      aria-label={actionLabel}
      title={actionLabel}
      onClick={onCopy}
      disabled={!onCopy}
    >
      <Icon aria-hidden="true" className={labeled ? "text-xs!" : "text-[14px]"}>content_copy</Icon>
      {labeled && "Copy"}
    </Button>
  );
}
