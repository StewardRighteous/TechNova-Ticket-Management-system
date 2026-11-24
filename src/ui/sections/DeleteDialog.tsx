import { FormActions } from "../molecules/FormActions";
import { useState, type ReactNode } from "react";
import { Button } from "../atoms/Button";
import { Input } from "../atoms/Input";
import { FormField } from "../molecules/FormField";
import { Dialog } from "./Dialog";

interface DeleteDialogProps {
  title: ReactNode;
  description: ReactNode;
  verification: string;
  onCancel: () => void;
  onDelete: () => void;
  deleteLabel?: string;
  deleteDisabled?: boolean;
  alternative?: { title: string; description: string; onClick: () => void };
}

export function DeleteDialog({
  title,
  description,
  verification,
  onCancel,
  onDelete,
  deleteLabel = "Permanently delete",
  deleteDisabled = false,
  alternative,
}: DeleteDialogProps) {
  const [confirmation, setConfirmation] = useState("");
  const canDelete = !deleteDisabled && confirmation === verification;

  return (
    <Dialog title={title} description={description} onClose={onCancel} width="small" alert>
      <form
        className="space-y-4 px-5 py-4 sm:px-7"
        onSubmit={(event) => {
          event.preventDefault();
          if (canDelete) onDelete();
        }}
      >
        {alternative && (
          <Button
            type="button"
            tone="plain"
            onClick={alternative.onClick}
            className="w-full rounded-lg border border-slate-300 px-4 py-3 text-left hover:bg-slate-50"
          >
            <span className="block text-sm font-semibold text-slate-900">{alternative.title}</span>
            <span className="mt-1 block text-xs text-slate-600">{alternative.description}</span>
          </Button>
        )}
        <FormField
          label={
            <>
              Type <strong>{verification}</strong> to confirm
            </>
          }
        >
          <Input
            autoComplete="off"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
          />
        </FormField>
        <FormActions>
          <Button autoFocus type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" tone="danger" disabled={!canDelete}>
            {deleteLabel}
          </Button>
        </FormActions>
      </form>
    </Dialog>
  );
}
