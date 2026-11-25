import type { ReactNode } from "react";
import { Heading } from "../atoms/Heading";
import { Icon } from "../atoms/Icon";

export function DetailCardHeader({ title, icon, actions, variant = "default" }: {
  title: string;
  icon: string;
  actions?: ReactNode;
  variant?: "default" | "compact";
}) {
  const compact = variant === "compact";
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <Heading variant={compact ? "plain" : "subsection"} className={`flex items-center gap-2 ${compact ? "text-xs font-semibold text-slate-700" : ""}`}>
        <Icon aria-hidden="true" className="text-base text-teal-700">{icon}</Icon>
        {title}
      </Heading>
      {actions}
    </div>
  );
}
