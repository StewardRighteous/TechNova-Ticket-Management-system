import type { ReactNode } from "react";
import { Button } from "../atoms/Button";
import { Dialog } from "./Dialog";

interface ConfirmationDialogProps {
  title: ReactNode;
  description: ReactNode;
  cancelLabel?: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
  danger?: boolean;
}

export function ConfirmationDialog({
  title,
  description,
  cancelLabel = "Cancel",
  confirmLabel,
  onCancel,
  onConfirm,
  danger,
}: ConfirmationDialogProps) {
  return (
    <Dialog title={title} description={description} onClose={onCancel} width="small" alert={danger}>
      <footer className="flex flex-wrap justify-end gap-2 px-5 py-4 sm:px-7">
        <Button autoFocus type="button" onClick={onCancel}>
          {cancelLabel}
        </Button>
        <Button type="button" tone={danger ? "danger" : "primary"} onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </footer>
    </Dialog>
  );
}
