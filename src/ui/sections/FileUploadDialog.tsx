import { Button } from "../atoms/Button";
import { Icon } from "../atoms/Icon";
import { Input } from "../atoms/Input";
import { Label } from "../atoms/Label";
import { FieldHint } from "../molecules/FieldHint";
import { SelectDropdown } from "../groups/SelectDropdown";
import { Dialog } from "./Dialog";

interface FileUploadDialogProps {
  category: string;
  onCategoryChange: (value: string) => void;
  onFilesChange: (files: File[]) => void;
  fileCount: number;
  loading: boolean;
  error: string;
  onSave: () => void;
  onCancel: () => void;
}

export function FileUploadDialog({ category, onCategoryChange, onFilesChange, fileCount, loading, error, onSave, onCancel }: FileUploadDialogProps) {
  const categories = ["General", "Enquiry", "Client-provided details", "Investigation", "Handover"];
  return <Dialog title="Add files" width="small" onClose={onCancel}>
    <div className="space-y-4 px-5 py-5 sm:px-7">
      <div>
        <div className="mb-1 flex items-center gap-1"><Label htmlFor="ticket-file-upload" className="text-xs font-semibold">Files</Label><FieldHint label="file size limit">Maximum 5 MB per file.</FieldHint></div>
        <div className="flex items-center gap-3 rounded-md border border-slate-300 px-3 py-2">
          <Label htmlFor="ticket-file-upload" className="inline-flex cursor-pointer items-center gap-1 rounded-md bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-800 hover:bg-slate-200 focus-within:outline-2 focus-within:outline-teal-700"><Icon className="text-base" aria-hidden="true">upload_file</Icon>Upload<Input id="ticket-file-upload" type="file" multiple onChange={(event) => onFilesChange(Array.from(event.target.files ?? []))} className="sr-only" /></Label>
          <span className="text-xs text-slate-500">{fileCount ? `${fileCount} file${fileCount === 1 ? "" : "s"} selected` : "No files selected"}</span>
        </div>
      </div>
      <SelectDropdown label="Category" showLabel value={category} onChange={onCategoryChange} options={categories.map((value) => ({ value, label: value }))} />
      {error && <p role="alert" className="text-xs text-rose-700">{error}</p>}
      <footer className="flex justify-end gap-2 border-t border-slate-100 pt-4"><Button tone="plain" type="button" onClick={onCancel} disabled={loading} className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-3 py-2 text-xs font-semibold"><Icon className="text-base" aria-hidden="true">close</Icon>Cancel</Button><Button tone="plain" type="button" onClick={onSave} disabled={!fileCount || loading} className="inline-flex items-center gap-1 rounded-md bg-teal-700 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"><Icon className="text-base" aria-hidden="true">save</Icon>{loading ? "Saving…" : "Save"}</Button></footer>
    </div>
  </Dialog>;
}
