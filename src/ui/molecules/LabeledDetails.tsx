import type { ReactNode } from "react";
import { CopyIconButton } from "../atoms/CopyIconButton";
import { Icon } from "../atoms/Icon";

interface DetailItem {
  label: string;
  icon: string;
  value: ReactNode;
  onCopy?: () => void;
}

export function LabeledDetails({ items, className }: { items: DetailItem[]; className?: string }) {
  return (
    <dl className={className}>
      {items.map(({ label, icon, value, onCopy }) => (
        <div key={label} className="min-w-0">
          <dt className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
            <Icon aria-hidden="true" className="text-base text-slate-500">{icon}</Icon>
            {label}
          </dt>
          <dd className="mt-1 flex min-h-10 items-center gap-2 rounded-md border border-slate-300 bg-slate-50 px-3 py-1 text-sm text-slate-900">
            <div className="min-w-0 flex-1 break-words">{value}</div>
            <CopyIconButton label={label} onCopy={onCopy} />
          </dd>
        </div>
      ))}
    </dl>
  );
}
