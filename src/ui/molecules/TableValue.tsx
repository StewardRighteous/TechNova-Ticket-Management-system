import { Icon } from "../atoms/Icon";

interface TableValueProps {
  icon: string;
  children: string | number | null | undefined;
}

export function TableValue({ icon, children }: TableValueProps) {
  if (children == null || (typeof children === "string" && !children.trim())) {
    return <span className="text-slate-500">N/A</span>;
  }

  return (
    <span className="inline-flex max-w-full items-center gap-1.5 align-middle">
      <Icon aria-hidden="true" className="shrink-0 text-[15px] leading-none text-slate-500">{icon}</Icon>
      <span className="min-w-0 truncate">{children}</span>
    </span>
  );
}
