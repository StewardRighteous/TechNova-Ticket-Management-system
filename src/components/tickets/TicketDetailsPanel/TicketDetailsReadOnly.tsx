import React from "react";
import type { Ticket } from "../../../types";
import { Detail } from "./shared";
export const TicketDetailsReadOnly: React.FC<{ ticket: Ticket }> = ({
  ticket,
}) => (
  <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-4">
    <Detail label="Title" value={ticket.title} wide />
    <Detail label="Client company" value={ticket.companyName} />
    <Detail
      label="Assigned to"
      value={`${ticket.assignedToName} · ${ticket.assignedToRole}`}
    />
    <Detail label="Ticket no." value={ticket.code} />
    <Detail label="Channel" value={ticket.channel} />
    <Detail label="Priority" value={ticket.priority} />
    <Detail label="Service line" value={ticket.serviceName} />
    <Detail label="Client contact" value={ticket.clientContact} />
    <Detail label="Description" value={ticket.description} wide />
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
        label="Diagnostics"
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
      <div className="sm:col-span-3 lg:col-span-4">
        <p className="mb-2 text-[10px] font-bold tracking-wide text-slate-400 uppercase">
          Attachments
        </p>
        <div className="flex flex-wrap gap-3">
          {ticket.attachments.map((file) => (
            <a key={file.id} href={file.url} target="_blank" rel="noreferrer">
              <img
                src={file.url}
                alt={file.name}
                className="h-20 w-20 rounded-lg border border-slate-200 object-cover"
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
);
