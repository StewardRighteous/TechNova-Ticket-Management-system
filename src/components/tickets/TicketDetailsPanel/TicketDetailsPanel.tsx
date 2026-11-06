import React, { useState } from "react";
import type { Ticket } from "../../../types";
import { createDraft } from "./draft";
import { TicketDetailsEditForm } from "./TicketDetailsEditForm";
import { TicketDetailsReadOnly } from "./TicketDetailsReadOnly";
import type { Draft, TicketDetailsPanelProps } from "./types";
export const TicketDetailsPanel: React.FC<TicketDetailsPanelProps> = ({
  ticket,
  companies,
  services,
  onSave,
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Draft>(() => createDraft(ticket));
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));
  const cancel = () => {
    setDraft(createDraft(ticket));
    setEditing(false);
  };
  const save = () => {
    const company = companies.find((item) => item.id === draft.companyId);
    const service = services.find((item) => item.id === draft.serviceId);
    const { tagsText, ...fields } = draft;
    const updates: Partial<Ticket> = {
      ...fields,
      companyName: company?.name ?? ticket.companyName,
      companyCode: company?.code ?? ticket.companyCode,
      serviceName: service?.name ?? ticket.serviceName,
      categoryId: draft.categoryId || undefined,
      dueAt: draft.dueAt || undefined,
      tags: tagsText
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      diagnosticData: Object.values(draft.diagnosticData).some(Boolean)
        ? draft.diagnosticData
        : undefined,
      resolutionDetails: draft.resolutionDetails || undefined,
    };
    onSave(updates);
    setEditing(false);
  };
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between p-2">
        <h2 className="text-lg font-bold text-slate-900">Ticket details</h2>
        {editing ? (
          <div className="flex gap-2">
            <button
              onClick={cancel}
              className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600"
            >
              Cancel
            </button>
            <button
              onClick={save}
              className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white"
            >
              Save changes
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700"
          >
            Edit details
          </button>
        )}
      </div>
      {editing ? (
        <TicketDetailsEditForm
          draft={draft}
          ticket={ticket}
          companies={companies}
          services={services}
          set={set}
        />
      ) : (
        <TicketDetailsReadOnly ticket={ticket} />
      )}
    </section>
  );
};
