import React from "react";
import type { Company, ServiceLine, Ticket } from "../../../types/barrel";
import { DiagnosticInput, Input, Read, Select, TextArea } from "./shared";
import type { Draft, TicketDetailsTab } from "./types";

type Props = {
  draft: Draft;
  ticket: Ticket;
  companies: Company[];
  services: ServiceLine[];
  set: <K extends keyof Draft>(key: K, value: Draft[K]) => void;
  activeTab: TicketDetailsTab;
  readonly: boolean;
};
export const TicketDetailsEditForm: React.FC<Props> = ({
  draft,
  ticket,
  companies,
  services,
  set,
  activeTab,
  readonly,
}) => {
  const selectedCompany = companies.find((item) => item.id === draft.companyId);
  const contacts = selectedCompany?.contacts?.length
    ? selectedCompany.contacts.map((contact) => [contact.id, `${contact.name} · ${contact.email}`] as [string, string])
    : selectedCompany ? [[`legacy-${selectedCompany.id}`, `${selectedCompany.contactName} · ${selectedCompany.contactEmail}`] as [string, string]] : [];
  const diagnostics =
    activeTab === "diagnostics"
      ? ([
          "clusterNode",
          "errorCode",
          "errorMessage",
        ] as const)
      : (["stepsToReproduce"] as const);
  return (
    <div className="mt-4 grid grid-cols-3 gap-x-8 gap-y-6 p-1">
      {activeTab === "overview" && (
        <>
          <Read label="Ticket no." value={ticket.code} />
          <Input
            label="Title"
            value={draft.title}
            set={(v) => set("title", v)}

            readonly={readonly}
          />
          <Read
            label="Client company"
            value={
              companies.find((item) => item.id === draft.companyId)?.name ||
              "Not set"
            }
          />
          <TextArea
            label="Description"
            value={draft.description}
            set={(v) => set("description", v)}
            wide
            readonly={readonly}
          />

          <Read
            label="Assigned to"
            value={`${ticket.assignedToName} · ${ticket.assignedToRole}`}
          />

          <Select
            label="Channel"
            value={draft.channel}
            options={[
              ["whatsapp", "WhatsApp"],
              ["email", "Email"],
              ["phone", "Phone"],
            ]}
            set={(v) => set("channel", v as Draft["channel"])}
            readonly={readonly}
          />
          <Select
            label="Priority"
            value={draft.priority}
            options={[
              ["P1 Urgent", "P1 Urgent"],
              ["P2 Normal", "P2 Normal"],
              ["P3 Low", "P3 Low"],
              ["P4 Trivial", "P4 Trivial"],
            ]}
            set={(v) => set("priority", v as Draft["priority"])}
            readonly={readonly}
          />
          <Input
            label="Client contact"
            value={draft.clientContact}
            set={(v) => set("clientContact", v)}
            readonly={readonly}
          />
        </>
      )}
      {activeTab === "context" && (
        <>
          <Input
            label="Title"
            value={draft.title}
            set={(v) => set("title", v)}

            readonly={readonly}
          />
          <TextArea
            label="Description"
            value={draft.description}
            set={(v) => set("description", v)}
            wide
            readonly={readonly}
          />
          <Select
            label="Service line"
            value={draft.serviceId}
            options={services.map((item) => [item.id, item.name])}
            set={(v) => set("serviceId", v)}
            readonly={readonly}
          />
          <Input
            label="Due date"
            value={draft.dueAt}
            set={(v) => set("dueAt", v)}
            readonly={readonly}
          />
          <Input
            label="SLA target"
            value={draft.slaDeadline}
            set={(v) => set("slaDeadline", v)}
            readonly={readonly}
          />
          <Select
            label="Priority"
            value={draft.priority}
            options={[
              ["P1 Urgent", "P1 Urgent"],
              ["P2 Normal", "P2 Normal"],
              ["P3 Low", "P3 Low"],
              ["P4 Trivial", "P4 Trivial"],
            ]}
            set={(v) => set("priority", v as Draft["priority"])}
            readonly={readonly}
          />
          <Select
            label="Channel"
            value={draft.channel}
            options={[
              ["whatsapp", "WhatsApp"],
              ["email", "Email"],
              ["phone", "Phone"],
            ]}
            set={(v) => set("channel", v as Draft["channel"])}
            readonly={readonly}
          />

          <Input
            label="Tags"
            value={draft.tagsText}
            set={(v) => set("tagsText", v)}
            readonly={readonly}
          />
          <Input
            label="Environment"
            value={draft.environment}
            set={(v) => set("environment", v)}
            readonly={readonly}
          />

          <TextArea
            label="Resolution details"
            value={draft.resolutionDetails}
            set={(v) => set("resolutionDetails", v)}
            wide
            readonly={readonly}
          />
        </>
      )}
      {activeTab === "client" && (
        <>
          <Read label="Client Id" value={draft.companyId} />
          <Select
            label="Client company"
            value={draft.companyId}
            options={companies.map((item) => [item.id, item.name])}
            set={(v) => {
              const nextCompany = companies.find((item) => item.id === v);
              const nextContact = nextCompany?.contacts?.find((contact) => contact.id === nextCompany.primaryContactId)
                ?? nextCompany?.contacts?.[0];
              set("companyId", v);
              set("contactId", nextContact?.id ?? (nextCompany ? `legacy-${nextCompany.id}` : undefined));
              set("clientContact", nextContact?.name ?? nextCompany?.contactName ?? "");
              set("supportSite", undefined);
            }}
            readonly={readonly}
          />
          <Select
            label="Client contact"
            value={draft.contactId ?? ""}
            options={contacts}
            set={(v) => {
              const contact = selectedCompany?.contacts?.find((item) => item.id === v);
              set("contactId", v);
              set("clientContact", contact?.name ?? selectedCompany?.contactName ?? "");
            }}
            readonly={readonly}
          />
          <Select
            label="Service line"
            value={draft.serviceId}
            options={services.map((item) => [item.id, item.name])}
            set={(v) => set("serviceId", v)}
            readonly={readonly}
          />
          <Read label="Assigned to" value={`${ticket.assignedToName} `} />
          {(selectedCompany?.supportSites?.length || draft.supportSite) && <Select
            label="Affected site or tenant"
            value={draft.supportSite ?? ""}
            options={[["", "Unspecified"], ...[...new Set([...(selectedCompany?.supportSites ?? []), ...(draft.supportSite ? [draft.supportSite] : [])])].map((site): [string, string] => [site, site])]}
            set={(site) => set("supportSite", site || undefined)}
            readonly={readonly}
          />}
          <Read
            label="Assigned Person Role"
            value={`${ticket.assignedToRole} `}
          />
        </>
      )}
      {(activeTab === "diagnostics" || activeTab === "reproduction") && (
      <div className="rounded-xl p-4 md:col-span-3">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {diagnostics.map((key) => (
              <DiagnosticInput
                key={key}
                label={({ clusterNode: "Cluster / server node", errorCode: "Error code", errorMessage: "Error message", stepsToReproduce: "Steps to reproduce" } as Record<string, string>)[key]}
                value={draft.diagnosticData[key]}
                readonly={readonly}
                onChange={(value) =>
                  set("diagnosticData", {
                    ...draft.diagnosticData,
                    [key]: value,
                  })
                }
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
