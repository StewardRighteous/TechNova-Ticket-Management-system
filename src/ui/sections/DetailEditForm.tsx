import { useState, type ReactNode } from "react";
import { Button } from "../atoms/Button";
import { Icon } from "../atoms/Icon";
import { DetailCardHeader } from "../molecules/DetailCardHeader";
import { ConfirmationDialog } from "./ConfirmationDialog";
import { detailFieldGrid } from "./DetailFieldGroup";

interface DetailEditFormProps {
  title: string;
  titleIcon: string;
  canEdit: boolean;
  layout?: "grid" | "grouped" | "section";
  onCancel: () => void;
  onSave: () => boolean;
  validate?: () => string | undefined;
  children: (editing: boolean) => ReactNode;
}

export function DetailEditForm({ title, titleIcon, canEdit, layout = "grid", onCancel, onSave, validate, children }: DetailEditFormProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [confirmation, setConfirmation] = useState<"save" | "discard" | null>(null);
  const [error, setError] = useState("");
  const editing = canEdit && isEditing;
  const saving = confirmation === "save";
  const entity = title.toLowerCase();
  const section = layout === "section";

  return (
    <>
      <form aria-label={layout === "grid" ? `${title} general details` : title} className={`@container ${section ? "space-y-2 border-t border-slate-200 pt-3 first:border-t-0 first:pt-0" : "space-y-3"}`} onSubmit={(event) => {
        event.preventDefault();
        if (!editing) return;
        const validationError = validate?.() ?? "";
        setError(validationError);
        if (!validationError) setConfirmation("save");
      }}>
        <DetailCardHeader
          title={title}
          icon={titleIcon}
          variant={section ? "compact" : "default"}
          actions={canEdit && (
            <div className="ml-auto flex flex-wrap justify-end gap-2">
              {editing ? <>
                <Button cancel size="small" type="button" onClick={() => setConfirmation("discard")}>Cancel</Button>
                <Button save size="small" type="submit" tone="primary">Save</Button>
              </> : <Button size="small" tone={section ? "ghost" : "secondary"} type="button" aria-label={section ? `Edit ${title}` : undefined} onClick={() => setIsEditing(true)}>
                <Icon aria-hidden="true" className="text-[16px]">edit</Icon>Edit
              </Button>}
            </div>
          )}
        />
        <fieldset disabled={layout === "grid" && !editing} className={layout === "grouped" ? "min-w-0 space-y-3" : detailFieldGrid}>
          {children(editing)}
        </fieldset>
        {editing && error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      </form>
      {editing && confirmation && <ConfirmationDialog
        title={`${saving ? "Save" : "Discard"} ${entity} changes?`}
        description={saving ? "Your changes will be applied to this record." : "Your unsaved changes will be lost."}
        cancelLabel="Keep editing"
        confirmLabel={saving ? "Save changes" : "Discard changes"}
        danger={!saving}
        onCancel={() => setConfirmation(null)}
        onConfirm={() => {
          setConfirmation(null);
          if (saving) {
            if (!onSave()) return;
          } else {
            onCancel();
          }
          setError("");
          setIsEditing(false);
        }}
      />}
    </>
  );
}
