import type { ToastMessage } from "../../types/barrel";
import { Button } from "../atoms/Button";
import { Icon } from "../atoms/Icon";

const themes = {
  info: { surface: "bg-slate-900 border-slate-800 text-white", icon: "info" },
  success: { surface: "bg-emerald-950/90 border-emerald-700 text-emerald-100", icon: "check_circle" },
  warning: { surface: "bg-amber-950/90 border-amber-700 text-amber-100", icon: "warning" },
  error: { surface: "bg-rose-950/90 border-rose-700 text-rose-100", icon: "error" },
};

export function ToastList({
  toasts,
  onDismiss,
}: {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}) {
  if (!toasts.length) return null;

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-4 bottom-5 z-50 flex flex-col gap-2 sm:left-auto sm:right-5 sm:w-full sm:max-w-sm"
    >
      {toasts.map((toast) => {
        const theme = themes[toast.type ?? "info"];
        return (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-center justify-between gap-3 rounded-xl border px-4 py-3 shadow-xl backdrop-blur-md ${theme.surface}`}
          >
            <Icon aria-hidden="true" className="shrink-0 text-[18px]">
              {theme.icon}
            </Icon>
            <p className="flex-1 text-xs font-medium leading-relaxed">{toast.message}</p>
            <Button
              type="button"
              tone="plain"
              onClick={() => onDismiss(toast.id)}
              className="rounded p-1 text-slate-400 transition-colors hover:text-white"
              aria-label="Dismiss toast"
            >
              <Icon aria-hidden="true" className="text-base">
                close
              </Icon>
            </Button>
          </div>
        );
      })}
    </div>
  );
}
