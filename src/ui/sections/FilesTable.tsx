import { Button } from "../atoms/Button";
import { CategoryBadge } from "../atoms/CategoryBadge";
import { Checkbox } from "../atoms/Checkbox";
import { ExternalLink } from "../atoms/ExternalLink";
import { Icon } from "../atoms/Icon";
import { TableValue } from "../molecules/TableValue";
import { PaginatedDataTable, TableHead, TableHeader, TableRow } from "./DataTable";

interface FileRow {
  id: string;
  name: string;
  url: string;
  size: number;
  uploadedAt?: string;
  category?: string;
}

interface FilesTableProps {
  files: FileRow[];
  onView: (name: string) => void;
  selectedIds: string[];
  onSelectionChange?: (ids: string[]) => void;
  hasFiles: boolean;
}

export function FilesTable({ files, onView, selectedIds, onSelectionChange, hasFiles }: FilesTableProps) {
  return <div>
    <PaginatedDataTable rows={files} scroll>
      {(pageFiles) => {
        const pageFileIds = new Set(pageFiles.map((file) => file.id));
        const allSelected = pageFiles.length > 0 && pageFiles.every((file) => selectedIds.includes(file.id));

        return <>
          <TableHead tone="plain" className="text-slate-500">
            <TableRow>
              {onSelectionChange && (
                <TableHeader density="narrow" className="rounded-l-md">
                  <Checkbox
                    aria-label="Select all visible files"
                    checked={allSelected}
                    disabled={!pageFiles.length}
                    onChange={() => onSelectionChange(allSelected
                      ? selectedIds.filter((id) => !pageFileIds.has(id))
                      : [...new Set([...selectedIds, ...pageFileIds])])}
                  />
                </TableHeader>
              )}
              <TableHeader density="narrow">File name</TableHeader>
              <TableHeader density="narrow">Category</TableHeader>
              <TableHeader density="narrow">Size</TableHeader>
              <TableHeader density="narrow">Uploaded</TableHeader>
              <TableHeader density="narrow" className="rounded-r-md">Actions</TableHeader>
            </TableRow>
          </TableHead>
          <tbody>{pageFiles.map((file) => {
            const date = file.uploadedAt ? new Date(file.uploadedAt) : null;
            const uploaded = date && !Number.isNaN(date.getTime()) ? date.toLocaleString(undefined, { year: "numeric", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) : "Not available";
            return <tr key={file.id} className="border-b border-slate-100">
              {onSelectionChange && <td className="px-3 py-2"><Checkbox aria-label={`Select ${file.name}`} checked={selectedIds.includes(file.id)} onChange={() => onSelectionChange(selectedIds.includes(file.id) ? selectedIds.filter((id) => id !== file.id) : [...selectedIds, file.id])} /></td>}
              <td className="px-3 py-2 font-semibold text-slate-700"><span className="flex items-center gap-2"><Icon className="text-base text-teal-700" aria-hidden="true">attach_file</Icon>{file.name}</span></td>
              <td className="px-3 py-2"><CategoryBadge category={file.category || "General"} /></td>
              <td className="whitespace-nowrap px-3 py-2 text-slate-600"><TableValue icon="storage">{file.size ? `${(file.size / 1024).toFixed(1)} KB` : "Not available"}</TableValue></td>
              <td className="whitespace-nowrap px-3 py-2 text-slate-600"><TableValue icon="schedule">{uploaded}</TableValue></td>
              <td className="whitespace-nowrap px-3 py-2"><div className="flex gap-1">
                <Button tone="plain" type="button" onClick={() => onView(file.name)} className="inline-flex items-center gap-1 rounded p-1.5 text-teal-700 hover:bg-teal-50" aria-label={`View ${file.name}`}><Icon className="text-base" aria-hidden="true">visibility</Icon>View</Button>
                <ExternalLink href={file.url} download={file.name} className="inline-flex items-center gap-1 rounded p-1.5 text-blue-700 hover:bg-blue-50" aria-label={`Download ${file.name}`}><Icon className="text-base" aria-hidden="true">download</Icon>Download</ExternalLink>
              </div></td>
            </tr>;
          })}</tbody>
        </>;
      }}
    </PaginatedDataTable>
    {!files.length && <p className="px-3 py-6 text-center text-xs text-slate-400">{hasFiles ? "No files match your search." : "No attached files."}</p>}
  </div>;
}

