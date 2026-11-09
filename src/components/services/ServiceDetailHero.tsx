import React, { useEffect, useState } from "react";
import type { ServiceLine } from "../../types";

interface ServiceDetailHeroProps {
  service: ServiceLine;
  onBack: () => void;
  onUpdateService: (updates: Partial<ServiceLine>) => void;
}
type Tab = "overview" | "operations";
const fields: Record<
  Tab,
  { key: keyof ServiceLine; label: string; type?: string; readOnly?: boolean }[]
> = {
  overview: [
    { key: "id", label: "Service ID", readOnly: true },
    { key: "code", label: "Service code", readOnly: true },
    { key: "name", label: "Service name" },
    { key: "department", label: "Department" },
    { key: "lead", label: "Service lead" },
    { key: "description", label: "Description" },
    { key: "technologies", label: "Technologies" },
  ],
  operations: [
    { key: "status", label: "Status" },
    { key: "slaTarget", label: "SLA target" },
    { key: "uptime", label: "Uptime", readOnly: true },
    {
      key: "activeTickets",
      label: "Active tickets",
      type: "number",
      readOnly: true,
    },
  ],
};
const valueText = (value: unknown) =>
  Array.isArray(value) ? value.join(", ") : String(value ?? "—");

export const ServiceDetailHero: React.FC<ServiceDetailHeroProps> = ({
  service,
  onUpdateService,
}) => {
  const [draft, setDraft] = useState<ServiceLine>(service);
  const [isEditing, setIsEditing] = useState(false);
  const [tab, setTab] = useState<Tab>("overview");
  const [confirmation, setConfirmation] = useState<"save" | "cancel" | null>(
    null,
  );
  useEffect(() => setDraft(service), [service]);
  const updateField = (key: keyof ServiceLine, value: string) =>
    setDraft((current) => ({
      ...current,
      [key]:
        key === "activeTickets"
          ? Number(value)
          : key === "technologies"
            ? value
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean)
            : value,
    }));
  const completeAction = () => {
    if (confirmation === "save") onUpdateService(draft);
    else if (confirmation === "cancel") setDraft(service);
    setConfirmation(null);
    setIsEditing(false);
  };
  const summary = [
    ["Department", service.department],
    ["Service lead", service.lead],
    ["SLA target", service.slaTarget],
    ["Status", service.status],
    ["Active tickets", service.activeTickets],
    ["Uptime", service.uptime],
  ];
  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-slate-900 p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-white">{service.name}</h1>
        <div className="mt-5 border-b border-slate-200" />
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {summary.map(([label, value]) => (
            <div key={label}>
              <p className="text-[8px] font-semibold tracking-wide text-white uppercase">
                {label}
              </p>
              <p className="mt-1 text-sm font-semibold text-white">{value}</p>
            </div>
          ))}
        </div>
      </section>
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Service details
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Review and manage the complete service profile.
            </p>
          </div>
          {!isEditing ? (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-200"
            >
              <span className="material-symbols-outlined text-[16px]">
                edit
              </span>{" "}
              Edit
            </button>
          ) : (
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setConfirmation("cancel")}
                className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setConfirmation("save")}
                className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
              >
                Save
              </button>
            </div>
          )}
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {(["overview", "operations"] as Tab[]).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setTab(item)}
              className={`rounded-lg px-3 py-2 text-xs font-semibold capitalize ${tab === item ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"}`}
            >
              {item}
            </button>
          ))}
        </div>
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {fields[tab].map((field) => (
            <label
              key={field.key}
              className="text-xs font-semibold text-slate-500"
            >
              {field.label}
              {isEditing && !field.readOnly ? (
                <input
                  type={field.type || "text"}
                  value={valueText(draft[field.key])}
                  onChange={(event) =>
                    updateField(field.key, event.target.value)
                  }
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              ) : (
                <span className="mt-2 block rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm font-normal text-slate-700">
                  {valueText(draft[field.key])}
                </span>
              )}
            </label>
          ))}
        </div>
      </section>
      {confirmation && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900">
              {confirmation === "save" ? "Save changes?" : "Discard changes?"}
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              {confirmation === "save"
                ? "Your service details will be updated."
                : "Your unsaved changes will be lost."}
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmation(null)}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
              >
                Go back
              </button>
              <button
                type="button"
                onClick={completeAction}
                className={`rounded-lg px-3 py-2 text-sm font-semibold text-white ${confirmation === "save" ? "bg-indigo-600 hover:bg-indigo-700" : "bg-red-600 hover:bg-red-700"}`}
              >
                {confirmation === "save" ? "Save changes" : "Discard"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
