import { FormActions } from "../molecules/FormActions";
import type { FormEvent, ReactNode } from "react";
import { Button } from "../atoms/Button";
import { Dialog } from "./Dialog";

interface DetailEditDialogProps {
  title: string;
  onCancel: () => void;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
  width?: "small" | "medium";
}

export function DetailEditDialog({ title, onCancel, onSave, children, width }: DetailEditDialogProps) {
  return (
    <Dialog title={title} onClose={onCancel} width={width}>
      <form onSubmit={onSave} className="space-y-4 px-5 py-4 sm:px-7">
        {children}
        <FormActions>
          <Button type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" tone="primary">
            Save
          </Button>
        </FormActions>
      </form>
    </Dialog>
  );
}
