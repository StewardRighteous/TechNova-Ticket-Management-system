import React, { useState } from "react";
import type { Ticket } from "../../../types/barrel";
import { createDraft } from "./draft";
import { TicketDetailsEditForm } from "./TicketDetailsEditForm";
import { ConfirmationDialog } from "./shared";

import type { Draft, TicketDetailsPanelProps, TicketDetailsTab } from "./types";
export const TicketDetailsPanel: React.FC<TicketDetailsPanelProps> = ({
  ticket,
  companies,
  services,
  onSave,
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Draft>(() => createDraft(ticket));
  const [confirmation, setConfirmation] = useState<"save" | "cancel" | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<TicketDetailsTab>("overview");
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
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-2 flex items-center justify-between">
        <div
          className="flex flex-wrap gap-2 border-b border-slate-100"
          role="tablist"
          aria-label="Ticket detail tabs"
        >
          {(
            [
              ["overview", "Overview"],
              ["context", "Context"],
              ["client", "Client"],
              ["diagnostics", "Diagnostics"],
              ["reproduction", "Reproduction"],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              role="tab"
              aria-selected={activeTab === key}
              onClick={() => setActiveTab(key)}
              className={`rounded-lg px-3 py-2 text-xs font-semibold ${activeTab === key ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"}`}
            >
              {label}
            </button>
          ))}
        </div>
        {editing ? (
          <div className="flex gap-2">
            <button
              onClick={() => setConfirmation("cancel")}
              className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600"
            >
              Cancel
            </button>
            <button
              onClick={() => setConfirmation("save")}
              className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white"
            >
              Save
            </button>
          </div>
        ) : (
          <button
            onClick={() => {
              setDraft(createDraft(ticket));
              setEditing(true);
            }}
            className="rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700"
          >
            Edit {activeTab}
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
          activeTab={activeTab}
          readonly={false}
        />
      ) : (
        <TicketDetailsEditForm
          draft={draft}
          ticket={ticket}
          companies={companies}
          services={services}
          set={set}
          activeTab={activeTab}
          readonly={true}
        />
      )}
      {confirmation && (
        <ConfirmationDialog
          action={confirmation}
          onConfirm={() => {
            if (confirmation === "save") save();
            else cancel();
            setConfirmation(null);
          }}
          onClose={() => setConfirmation(null)}
        />
      )}
    </section>
  );
};
