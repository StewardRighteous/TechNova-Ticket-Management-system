import { useEffect, useId, useRef, type FormEvent, type ReactNode } from "react";

export function DetailEditDialog({ title, onCancel, onSave, children }: {
  title: string;
  onCancel: () => void;
  onSave: (event: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const titleId = useId();
  useEffect(() => { dialog.current?.showModal(); }, []);

  return (
    <dialog ref={dialog} aria-labelledby={titleId} onCancel={onCancel} className="m-auto max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-2xl rounded-xl border border-slate-200 bg-white p-4 text-slate-800 shadow-xl backdrop:bg-slate-950/40">
      <h2 id={titleId} className="mb-4 text-base font-bold">{title}</h2>
      <form onSubmit={onSave} className="space-y-4">
        {children}
        <div className="flex justify-end gap-2 border-t border-slate-200 pt-3">
          <button type="button" onClick={onCancel} className="rounded-md px-3 py-1.5 text-sm font-semibold hover:bg-slate-100">Cancel</button>
          <button type="submit" className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white">Save</button>
        </div>
      </form>
    </dialog>
  );
}
