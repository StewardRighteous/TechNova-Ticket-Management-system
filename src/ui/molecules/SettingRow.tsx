import type { ReactNode } from "react";
import { Heading } from "../atoms/Heading";

export function SettingRow({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
      <div className="max-w-2xl">
        <Heading as="h3" variant="subsection">
          {title}
        </Heading>
        <p className="mt-1 text-sm leading-5 text-slate-500">{description}</p>
      </div>
      <div className="flex shrink-0 items-center sm:pl-8">{children}</div>
    </div>
  );
}
