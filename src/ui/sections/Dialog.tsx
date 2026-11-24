import { useEffect, useId, useRef, type ReactNode } from "react";
import { Button } from "../atoms/Button";
import { Heading } from "../atoms/Heading";
import { Icon } from "../atoms/Icon";

const widths = { small: "max-w-md", medium: "max-w-2xl", wide: "max-w-4xl" };

interface DialogProps {
  title: ReactNode;
  description?: ReactNode;
  section?: string;
  onClose: () => void;
  children?: ReactNode;
  width?: keyof typeof widths;
  alert?: boolean;
  showCloseButton?: boolean;
  className?: string;
}

export function Dialog({
  title,
  description,
  section,
  onClose,
  children,
  width = "medium",
  alert = false,
  showCloseButton = false,
  className = "",
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);

  return (
    <dialog
      ref={dialogRef}
      role={alert ? "alertdialog" : undefined}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className={`m-auto max-h-[calc(100dvh-1.5rem)] w-[calc(100%_-_1.5rem)] overflow-visible rounded-xl border border-slate-200 bg-white text-slate-900 shadow-2xl backdrop:bg-slate-950/55 ${widths[width]} ${className}`}
    >
      <div className="flex max-h-[calc(100dvh-1.5rem)] flex-col">
        <div className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-3.5 sm:px-7">
          <div className="min-w-0">
            {section && (
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-teal-700">
                {section}
              </p>
            )}
            <Heading id={titleId} variant={section ? "page" : "dialog"}>
              {title}
            </Heading>
          </div>
          {showCloseButton && (
            <Button
              type="button"
              tone="ghost"
              size="icon"
              onClick={onClose}
              aria-label="Close"
              title="Close"
            >
              <Icon aria-hidden="true" className="text-[22px]">
                close
              </Icon>
            </Button>
          )}
        </div>
        <div className="min-h-0 overflow-y-auto">
          {description && (
            <p id={descriptionId} className="px-5 pt-4 text-sm leading-5 text-slate-600 sm:px-7">
              {description}
            </p>
          )}
          {children}
        </div>
      </div>
    </dialog>
  );
}
