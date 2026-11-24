import type { ReactNode } from "react";

export function InteractiveListRow({
  onOpen,
  children,
  className = "",
}: {
  onOpen: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      role="button"
      tabIndex={0}
      className={`w-full text-left transition hover:bg-slate-50 focus-visible:bg-indigo-50/50 focus-visible:outline-2 focus-visible:outline-brand-teal ${className}`}
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget || (event.key !== "Enter" && event.key !== " ")) return;
        event.preventDefault();
        onOpen();
      }}
    >
      {children}
    </div>
  );
}
