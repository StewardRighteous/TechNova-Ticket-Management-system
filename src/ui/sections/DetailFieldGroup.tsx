import { useId, type ReactNode } from "react";
import { Heading } from "../atoms/Heading";
import { Icon } from "../atoms/Icon";

export const detailFieldGrid = "grid min-w-0 gap-x-3 gap-y-2 @lg:grid-cols-2 @3xl:grid-cols-3";

export function DetailFieldGroup({ title, icon, actions, children }: { title: string; icon?: string; actions?: ReactNode; children: ReactNode }) {
  const id = useId();

  return (
    <section aria-labelledby={id} className="border-t border-slate-200 pt-3 first:border-t-0 first:pt-0">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <Heading id={id} as="h3" variant="plain" className="flex items-center gap-2 text-xs font-semibold text-slate-700">
          {icon && <Icon aria-hidden="true" className="text-base text-teal-700">{icon}</Icon>}
          {title}
        </Heading>
        {actions}
      </div>
      <div className={detailFieldGrid}>{children}</div>
    </section>
  );
}
