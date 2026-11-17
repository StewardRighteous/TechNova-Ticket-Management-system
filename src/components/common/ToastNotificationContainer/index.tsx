import React from "react";
import { useTicketStore } from "../../../store/barrel";

export const ToastNotificationContainer: React.FC = () => {
  const { toasts, removeToast } = useTicketStore();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full"
    >
      {toasts.map((toast) => {
        let bgBorder = "bg-slate-900 border-slate-800 text-white";
        let icon = "info";

        if (toast.type === "success") {
          bgBorder = "bg-emerald-950/90 border-emerald-700 text-emerald-100";
          icon = "check_circle";
        } else if (toast.type === "warning") {
          bgBorder = "bg-amber-950/90 border-amber-700 text-amber-100";
          icon = "warning";
        } else if (toast.type === "error") {
          bgBorder = "bg-rose-950/90 border-rose-700 text-rose-100";
          icon = "error";
        }

        return (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto flex items-center justify-between gap-3 rounded-xl border px-4 py-3 shadow-xl backdrop-blur-md transition-all duration-200 animate-in fade-in slide-in-from-bottom-2 ${bgBorder}`}
          >
            <div className="flex items-center gap-2.5">
              <span className="material-symbols-outlined text-[18px] shrink-0">
                {icon}
              </span>
              <p className="text-xs font-medium leading-relaxed">
                {toast.message}
              </p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="rounded p-1 text-slate-400 hover:text-white transition-colors"
              aria-label="Dismiss toast"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        );
      })}
    </div>
  );
};

