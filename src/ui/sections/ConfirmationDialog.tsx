import type { ReactNode } from "react";
import { Button } from "../atoms/Button";
import { Icon } from "../atoms/Icon";
import { Dialog } from "./Dialog";

interface ConfirmationDialogProps {
  title: ReactNode;
  description: ReactNode;
  cancelLabel?: string;
  confirmLabel: string;
  onCancel: () => void;
  onConfirm: () => void;
  alternativeLabel?: string;
  onAlternative?: () => void;
  actionIcons?: { alternative: string; cancel: string; confirm: string };
  danger?: boolean;
}

export function ConfirmationDialog({
  title,
  description,
  cancelLabel = "Cancel",
  confirmLabel,
  onCancel,
  onConfirm,
  alternativeLabel,
  onAlternative,
  actionIcons,
  danger,
}: ConfirmationDialogProps) {
  return (
    <Dialog title={title} description={description} onClose={onCancel} width={actionIcons ? "medium" : "small"} alert={danger}>
      <footer className="flex flex-wrap justify-end gap-2 px-5 py-4 sm:px-7">
        {alternativeLabel && onAlternative && <Button tone="secondaryDanger" type="button" onClick={onAlternative}>{actionIcons && <Icon aria-hidden="true" className="text-lg">{actionIcons.alternative}</Icon>}{alternativeLabel}</Button>}
        <Button cancel={cancelLabel === "Cancel"} autoFocus type="button" onClick={onCancel}>
          {actionIcons && <Icon aria-hidden="true" className="text-lg">{actionIcons.cancel}</Icon>}
          {cancelLabel}
        </Button>
        <Button save={!actionIcons && /^save\b/i.test(confirmLabel)} type="button" tone={danger ? "danger" : "primary"} onClick={onConfirm}>
          {actionIcons && <Icon aria-hidden="true" className="text-lg">{actionIcons.confirm}</Icon>}
          {confirmLabel}
        </Button>
      </footer>
    </Dialog>
  );
}
