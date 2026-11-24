import { Button } from "../../../ui/barrel";
import React, { useEffect, useRef, useState } from "react";
import type { Ticket } from "../../../types/barrel";
import { createDraft, localDueAt } from "./draft";
import { TicketDetailsEditForm } from "./TicketDetailsEditForm";
import { TicketEditConfirmation } from "./shared";

import type { Draft, TicketDetailsPanelProps, TicketDetailsTab } from "./types";
export const TicketDetailsPanel: React.FC<TicketDetailsPanelProps> = ({
  ticket,
  companies,
  services,
  onSave,
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Draft>(() => createDraft(ticket, companies));
  const [confirmation, setConfirmation] = useState<"save" | "cancel" | null>(
    null,
  );
  const [activeTab, setActiveTab] = useState<TicketDetailsTab>("overview");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const cancelButtonRef = useRef<HTMLButtonElement | null>(null);
  useEffect(() => {
    setDraft(createDraft(ticket, companies));
    setEditing(false);
  }, [ticket, companies]);
  const tabs: [TicketDetailsTab, string][] = [["overview", "Overview"], ["context", "Context"], ["client", "Client"], ["diagnostics", "Diagnostics"], ["reproduction", "Reproduction"]];
  const moveTab = (event: React.KeyboardEvent, index: number) => {
    const target = event.key === "ArrowRight" ? (index + 1) % tabs.length : event.key === "ArrowLeft" ? (index + tabs.length - 1) % tabs.length : event.key === "Home" ? 0 : event.key === "End" ? tabs.length - 1 : -1;
    if (target >= 0) { event.preventDefault(); setActiveTab(tabs[target][0]); tabRefs.current[target]?.focus(); }
  };
  const isDirty = JSON.stringify(draft) !== JSON.stringify(createDraft(ticket, companies));
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));
  const cancel = () => {
    setDraft(createDraft(ticket, companies));
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
      dueAt: draft.dueAt === localDueAt(ticket.dueAt)
        ? ticket.dueAt
        : draft.dueAt ? new Date(draft.dueAt).toISOString() : undefined,
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
            tabs
          ).map(([key, label], index) => (
            <Button tone="plain"
              key={key}
              role="tab"
              id={`ticket-tab-${key}`}
              aria-controls={`ticket-panel-${key}`}
              aria-selected={activeTab === key}
              tabIndex={activeTab === key ? 0 : -1}
              ref={(node) => { tabRefs.current[index] = node; }}
              onKeyDown={(event) => moveTab(event, index)}
              onClick={() => setActiveTab(key)}
              className={`rounded-lg px-3 py-2 text-xs font-semibold ${activeTab === key ? "bg-indigo-600 text-white" : "bg-slate-100 text-slate-600"}`}
            >
              {label}
            </Button>
          ))}
        </div>
        {editing ? (
          <div className="flex gap-2">
            <Button tone="plain"
              ref={cancelButtonRef}
              onClick={() => isDirty ? setConfirmation("cancel") : cancel()}
              className="rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600"
            >
              Cancel
            </Button>
            <Button tone="primary"
              onClick={save}

            >
              Save
            </Button>
          </div>
        ) : (
              <Button tone="plain"
            onClick={() => {
              setDraft(createDraft(ticket, companies));
              setEditing(true);
            }}
            className="rounded-lg bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700"
          >
            Edit {activeTab}
          </Button>
        )}
      </div>

      <div role="tabpanel" id={`ticket-panel-${activeTab}`} aria-labelledby={`ticket-tab-${activeTab}`}>
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
      </div>
      {confirmation && (
        <TicketEditConfirmation
          action={confirmation}
          onConfirm={() => {
            if (confirmation === "save") save();
            else { cancel(); requestAnimationFrame(() => cancelButtonRef.current?.focus()); }
            setConfirmation(null);
          }}
          onClose={() => setConfirmation(null)}
        />
      )}
    </section>
  );
};
