import React from "react";
import type { Company, ServiceLine, Ticket } from "../../../types";
import { DiagnosticInput, fieldClass } from "./shared";
import type { Draft } from "./types";
type Props = {
  draft: Draft;
  ticket: Ticket;
  companies: Company[];
  services: ServiceLine[];
  set: <K extends keyof Draft>(key: K, value: Draft[K]) => void;
};
export const TicketDetailsEditForm: React.FC<Props> = ({
  draft,
  ticket,
  companies,
  services,
  set,
}) => (
  <div className="grid gap-4 md:grid-cols-3">
    <Input
      label="Title"
      value={draft.title}
      set={(value) => set("title", value)}
      wide
    />
    <Select
      label="Client company"
      value={draft.companyId}
      options={companies.map((item) => [item.id, item.name])}
      set={(value) => set("companyId", value)}
    />
    <Read
      label="Assigned to"
      value={`${ticket.assignedToName} · ${ticket.assignedToRole}`}
    />
    <Input
      label="Contact person"
      value={draft.clientContact}
      set={(value) => set("clientContact", value)}
    />
    <Select
      label="Service line"
      value={draft.serviceId}
      options={services.map((item) => [item.id, item.name])}
      set={(value) => set("serviceId", value)}
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
      set={(value) => set("priority", value as Draft["priority"])}
    />
    <Input
      label="Category"
      value={draft.categoryId}
      set={(value) => set("categoryId", value)}
    />
    <Input
      label="Environment"
      value={draft.environment}
      set={(value) => set("environment", value)}
    />
    <Input
      label="System revision"
      value={draft.systemRevision}
      set={(value) => set("systemRevision", value)}
    />
    <Input
      label="Tags"
      value={draft.tagsText}
      set={(value) => set("tagsText", value)}
      wide
    />
    <TextArea
      label="Description"
      value={draft.description}
      set={(value) => set("description", value)}
      wide
    />
    <TextArea
      label="Resolution details"
      value={draft.resolutionDetails}
      set={(value) => set("resolutionDetails", value)}
      wide
    />
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 md:col-span-3">
      <p className="mb-2 text-xs font-semibold text-slate-600">
        Diagnostic details
      </p>
      <div className="grid gap-3 sm:grid-cols-4">
        {(
          [
            "browser",
            "operatingSystem",
            "device",
            "clusterNode",
            "errorRate",
            "errorCode",
            "errorMessage",
            "stepsToReproduce",
            "expectedBehavior",
            "actualBehavior",
          ] as const
        ).map((key) => (
          <DiagnosticInput
            key={key}
            label={key}
            value={draft.diagnosticData[key]}
            onChange={(value) =>
              set("diagnosticData", { ...draft.diagnosticData, [key]: value })
            }
          />
        ))}
      </div>
    </div>
  </div>
);
const Input: React.FC<{
  label: string;
  value?: string;
  set: (value: string) => void;
  wide?: boolean;
}> = ({ label, value, set, wide }) => (
  <div
    className={`rounded-xl bg-slate-100 p-3 ${wide ? "sm:col-span-3 lg:col-span-4" : ""}`}
  >
    <label
      className={`text-xs font-semibold text-slate-600 ${wide ? "md:col-span-3" : ""}`}
    >
      {label}
      <input
        className={`${fieldClass} mt-1`}
        value={value ?? ""}
        onChange={(event) => set(event.target.value)}
      />
    </label>
  </div>
);
const TextArea: React.FC<{
  label: string;
  value?: string;
  set: (value: string) => void;
  wide?: boolean;
}> = ({ label, value, set, wide }) => (
  <label
    className={`text-xs font-semibold text-slate-600 ${wide ? "md:col-span-3" : ""}`}
  >
    {label}
    <textarea
      className={`${fieldClass} mt-1`}
      rows={3}
      value={value ?? ""}
      onChange={(event) => set(event.target.value)}
    />
  </label>
);
const Select: React.FC<{
  label: string;
  value: string;
  options: string[][];
  set: (value: string) => void;
}> = ({ label, value, options, set }) => (
  <label className="text-xs font-semibold text-slate-600">
    {label}
    <select
      className={`${fieldClass} mt-1`}
      value={value}
      onChange={(event) => set(event.target.value)}
    >
      {options.map(([key, text]) => (
        <option key={key} value={key}>
          {text}
        </option>
      ))}
    </select>
  </label>
);
const Read: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="text-xs font-semibold text-slate-600">
    {label}
    <p className="mt-1 rounded-lg bg-slate-100 px-3 py-2 text-xs font-normal text-slate-800">
      {value}
    </p>
  </div>
);
