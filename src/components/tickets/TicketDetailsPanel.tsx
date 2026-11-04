import React, { useState } from "react";
import type {
  Company,
  InboundChannel,
  ServiceLine,
  Ticket,
  TicketDiagnosticData,
  TicketPriority,
} from "../../types";

interface TicketDetailsPanelProps {
  ticket: Ticket;
  companies: Company[];
  services: ServiceLine[];
  onSave: (updates: Partial<Ticket>) => void;
}

type Draft = Pick<
  Ticket,
  | "title"
  | "description"
  | "companyId"
  | "serviceId"
  | "priority"
  | "channel"
  | "clientContact"
  | "slaDeadline"
  | "environment"
  | "systemRevision"
  | "resolutionDetails"
> & {
  categoryId: string;
  dueAt: string;
  tagsText: string;
  diagnosticData: TicketDiagnosticData;
};

const fieldClass =
  "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500";

export const TicketDetailsPanel: React.FC<TicketDetailsPanelProps> = ({
  ticket,
  companies,
  services,
  onSave,
}) => {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Draft>(() => ({
    title: ticket.title,
    description: ticket.description,
    companyId: ticket.companyId,
    serviceId: ticket.serviceId,
    priority: ticket.priority,
    channel: ticket.channel,
    clientContact: ticket.clientContact,
    slaDeadline: ticket.slaDeadline,
    environment: ticket.environment,
    systemRevision: ticket.systemRevision,
    resolutionDetails: ticket.resolutionDetails ?? "",
    categoryId: ticket.categoryId ?? "",
    dueAt: ticket.dueAt ?? "",
    tagsText: ticket.tags.join(", "),
    diagnosticData: ticket.diagnosticData ?? {},
  }));

  const set = <K extends keyof Draft>(key: K, value: Draft[K]) =>
    setDraft((current) => ({ ...current, [key]: value }));
  const cancel = () => {
    setDraft({
      title: ticket.title,
      description: ticket.description,
      companyId: ticket.companyId,
      serviceId: ticket.serviceId,
      priority: ticket.priority,
      channel: ticket.channel,
      clientContact: ticket.clientContact,
      slaDeadline: ticket.slaDeadline,
      environment: ticket.environment,
      systemRevision: ticket.systemRevision,
      resolutionDetails: ticket.resolutionDetails ?? "",
      categoryId: ticket.categoryId ?? "",
      dueAt: ticket.dueAt ?? "",
      tagsText: ticket.tags.join(", "),
      diagnosticData: ticket.diagnosticData ?? {},
    });
    setEditing(false);
  };
  const save = () => {
    const company = companies.find((item) => item.id === draft.companyId);
    const service = services.find((item) => item.id === draft.serviceId);
    const { tagsText, ...draftFields } = draft;
    onSave({
      ...draftFields,
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
    });
    setEditing(false);
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between p-2">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Ticket details</h2>
        </div>
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
        <div className="grid gap-4 md:grid-cols-3">
          <label className="text-xs font-semibold text-slate-600">
            Title
            <input
              className={`${fieldClass} mt-1`}
              value={draft.title}
              onChange={(e) => set("title", e.target.value)}
            />
          </label>
          <label className="text-xs font-semibold text-slate-600">
            Client company
            <select
              className={`${fieldClass} mt-1`}
              value={draft.companyId}
              onChange={(e) => set("companyId", e.target.value)}
            >
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-600">
            Service line
            <select
              className={`${fieldClass} mt-1`}
              value={draft.serviceId}
              onChange={(e) => set("serviceId", e.target.value)}
            >
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-600">
            Priority
            <select
              className={`${fieldClass} mt-1`}
              value={draft.priority}
              onChange={(e) =>
                set("priority", e.target.value as TicketPriority)
              }
            >
              <option>P1 Urgent</option>
              <option>P2 Normal</option>
              <option>P3 Low</option>
              <option>P4 Trivial</option>
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-600">
            Channel
            <select
              className={`${fieldClass} mt-1`}
              value={draft.channel}
              onChange={(e) => set("channel", e.target.value as InboundChannel)}
            >
              <option value="whatsapp">WhatsApp</option>
              <option value="email">Email</option>
              <option value="phone">Phone</option>
            </select>
          </label>
          <label className="text-xs font-semibold text-slate-600">
            Contact person
            <input
              className={`${fieldClass} mt-1`}
              value={draft.clientContact}
              onChange={(e) => set("clientContact", e.target.value)}
            />
          </label>
          <label className="text-xs font-semibold text-slate-600">
            SLA target
            <input
              className={`${fieldClass} mt-1`}
              value={draft.slaDeadline}
              onChange={(e) => set("slaDeadline", e.target.value)}
            />
          </label>
          <label className="text-xs font-semibold text-slate-600">
            Category
            <input
              className={`${fieldClass} mt-1`}
              value={draft.categoryId}
              onChange={(e) => set("categoryId", e.target.value)}
            />
          </label>
          <label className="text-xs font-semibold text-slate-600">
            Due date
            <input
              type="datetime-local"
              className={`${fieldClass} mt-1`}
              value={draft.dueAt.slice(0, 16)}
              onChange={(e) =>
                set(
                  "dueAt",
                  e.target.value ? new Date(e.target.value).toISOString() : "",
                )
              }
            />
          </label>
          <label className="text-xs font-semibold text-slate-600 md:col-span-2">
            Tags
            <input
              className={`${fieldClass} mt-1`}
              value={draft.tagsText}
              onChange={(e) => set("tagsText", e.target.value)}
              placeholder="Separate tags with commas"
            />
          </label>
          <label className="text-xs font-semibold text-slate-600">
            Environment
            <input
              className={`${fieldClass} mt-1`}
              value={draft.environment}
              onChange={(e) => set("environment", e.target.value)}
            />
          </label>

          <label className="text-xs font-semibold text-slate-600 md:col-span-2">
            Description
            <textarea
              className={`${fieldClass} mt-1`}
              rows={4}
              value={draft.description}
              onChange={(e) => set("description", e.target.value)}
            />
          </label>
          <label className="text-xs font-semibold text-slate-600">
            System revision
            <input
              className={`${fieldClass} mt-1`}
              value={draft.systemRevision}
              onChange={(e) => set("systemRevision", e.target.value)}
            />
          </label>
          <label className="text-xs font-semibold text-slate-600 md:col-span-3">
            Resolution details
            <textarea
              className={`${fieldClass} mt-1`}
              rows={3}
              value={draft.resolutionDetails}
              onChange={(e) => set("resolutionDetails", e.target.value)}
              placeholder="Add resolution notes when available"
            />
          </label>
          <div className="md:col-span-3 lg:col-span-3">
            <p className="mb-2 text-xs font-semibold text-slate-600">
              Diagnostic details
            </p>
            <div className="grid gap-3 sm:grid-cols-4">
              <DiagnosticInput
                label="Browser"
                value={draft.diagnosticData.browser}
                onChange={(value) =>
                  set("diagnosticData", {
                    ...draft.diagnosticData,
                    browser: value,
                  })
                }
              />
              <DiagnosticInput
                label="Operating system"
                value={draft.diagnosticData.operatingSystem}
                onChange={(value) =>
                  set("diagnosticData", {
                    ...draft.diagnosticData,
                    operatingSystem: value,
                  })
                }
              />
              <DiagnosticInput
                label="Device"
                value={draft.diagnosticData.device}
                onChange={(value) =>
                  set("diagnosticData", {
                    ...draft.diagnosticData,
                    device: value,
                  })
                }
              />
              <DiagnosticInput
                label="Cluster node"
                value={draft.diagnosticData.clusterNode}
                onChange={(value) =>
                  set("diagnosticData", {
                    ...draft.diagnosticData,
                    clusterNode: value,
                  })
                }
              />
              <label className="text-[11px] font-medium text-slate-500">
                Affected users
                <input
                  type="number"
                  min="0"
                  className={`${fieldClass} mt-1`}
                  value={draft.diagnosticData.affectedUsers ?? ""}
                  onChange={(e) =>
                    set("diagnosticData", {
                      ...draft.diagnosticData,
                      affectedUsers: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                    })
                  }
                />
              </label>
              <DiagnosticInput
                label="Error rate"
                value={draft.diagnosticData.errorRate}
                onChange={(value) =>
                  set("diagnosticData", {
                    ...draft.diagnosticData,
                    errorRate: value,
                  })
                }
              />
              <DiagnosticInput
                label="Error code"
                value={draft.diagnosticData.errorCode}
                onChange={(value) =>
                  set("diagnosticData", {
                    ...draft.diagnosticData,
                    errorCode: value,
                  })
                }
              />
              <DiagnosticInput
                label="Error message"
                value={draft.diagnosticData.errorMessage}
                onChange={(value) =>
                  set("diagnosticData", {
                    ...draft.diagnosticData,
                    errorMessage: value,
                  })
                }
              />
              <DiagnosticInput
                label="Steps to reproduce"
                value={draft.diagnosticData.stepsToReproduce}
                onChange={(value) =>
                  set("diagnosticData", {
                    ...draft.diagnosticData,
                    stepsToReproduce: value,
                  })
                }
              />
              <DiagnosticInput
                label="Expected behavior"
                value={draft.diagnosticData.expectedBehavior}
                onChange={(value) =>
                  set("diagnosticData", {
                    ...draft.diagnosticData,
                    expectedBehavior: value,
                  })
                }
              />
              <DiagnosticInput
                label="Actual behavior"
                value={draft.diagnosticData.actualBehavior}
                onChange={(value) =>
                  set("diagnosticData", {
                    ...draft.diagnosticData,
                    actualBehavior: value,
                  })
                }
              />
            </div>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
          <Detail label="Description" value={ticket.description} wide />
          <Detail label="Client contact" value={ticket.clientContact} />
          <Detail
            label="Assigned specialist"
            value={`${ticket.assignedToName} · ${ticket.assignedToRole}`}
          />
          <Detail label="Service line" value={ticket.serviceName} />
          <Detail label="Reported through" value={ticket.channel} />
          <Detail
            label="Created"
            value={new Date(ticket.createdAt).toLocaleString()}
          />
          <Detail
            label="Last updated"
            value={new Date(ticket.updatedAt).toLocaleString()}
          />
          <Detail label="SLA target" value={ticket.slaDeadline} />
          <Detail label="Category" value={ticket.categoryId || "Not set"} />
          <Detail
            label="Due date"
            value={
              ticket.dueAt ? new Date(ticket.dueAt).toLocaleString() : "Not set"
            }
          />
          <Detail label="Tags" value={ticket.tags.join(", ") || "None"} />
          <Detail label="Environment" value={ticket.environment} />
          <Detail label="System revision" value={ticket.systemRevision} />
          <Detail
            label="Resolution"
            value={ticket.resolutionDetails || "Not recorded"}
            wide
          />
          {ticket.diagnosticData && (
            <Detail
              label="Diagnostic details"
              value={
                Object.entries(ticket.diagnosticData)
                  .filter(([, value]) => value !== undefined && value !== "")
                  .map(([key, value]) => `${key}: ${value}`)
                  .join("\n") || "None"
              }
              wide
            />
          )}
          {!!ticket.attachments?.length && (
            <div className="sm:col-span-2 lg:col-span-3">
              <p className="mb-2 text-[10px] font-bold tracking-wide text-slate-400 uppercase">
                Attachments
              </p>
              <div className="flex flex-wrap gap-3">
                {ticket.attachments.map((file) => (
                  <a
                    key={file.id}
                    href={file.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group"
                  >
                    <img
                      src={file.url}
                      alt={file.name}
                      className="h-20 w-20 rounded-lg border border-slate-200 object-cover group-hover:border-indigo-400"
                    />
                    <span className="mt-1 block max-w-20 truncate text-[10px] text-indigo-600">
                      {file.name}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};

const Detail: React.FC<{ label: string; value: string; wide?: boolean }> = ({
  label,
  value,
  wide,
}) => (
  <div
    className={`rounded-xl bg-slate-100 p-3 ${wide ? "sm:col-span-2 lg:col-span-4" : ""}`}
  >
    <p className="mb-1 text-[10px] font-bold tracking-wide text-slate-500 uppercase">
      {label}
    </p>
    <p className="text-xs leading-relaxed whitespace-pre-wrap text-slate-800">
      {value}
    </p>
  </div>
);

const DiagnosticInput: React.FC<{
  label: string;
  value?: string;
  onChange: (value: string) => void;
}> = ({ label, value, onChange }) => (
  <label className="text-[11px] font-medium text-slate-500">
    {label}
    <input
      className={`${fieldClass} mt-1`}
      value={value ?? ""}
      onChange={(e) => onChange(e.target.value)}
    />
  </label>
);
