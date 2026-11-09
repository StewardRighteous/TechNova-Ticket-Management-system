import React, { useEffect, useState } from "react";
import type { Company } from "../../types";

interface CompanyDetailHeroProps {
  company: Company;
  onBack: () => void;
  onUpdateCompany: (updates: Partial<Company>) => void;
}

type Tab = "contact" | "account" | "system";
const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: "contact", label: "Contact", icon: "contacts" },
  { id: "account", label: "Account", icon: "business_center" },
  { id: "system", label: "System", icon: "settings" },
];
const fields: Record<
  Tab,
  { key: keyof Company; label: string; type?: string; readOnly?: boolean }[]
> = {
  contact: [
    { key: "id", label: "Company ID", readOnly: true },
    { key: "code", label: "Company code", readOnly: true },
    { key: "name", label: "Company name" },
    { key: "contactName", label: "Primary contact" },
    { key: "contactRole", label: "Contact role" },
    { key: "contactEmail", label: "Contact email", type: "email" },
    { key: "contactPhone", label: "Contact phone", type: "tel" },
  ],
  account: [
    { key: "tier", label: "Account tier" },
    { key: "accountManager", label: "Account manager" },
    { key: "status", label: "Account status" },
    { key: "preferredChannel", label: "Preferred channel" },
    { key: "activeContracts", label: "Active contracts", type: "number" },
    { key: "subscribedServices", label: "Subscribed services" },
  ],
  system: [
    {
      key: "activeTickets",
      label: "Active tickets",
      type: "number",
      readOnly: true,
    },
    { key: "slaResponseTime", label: "SLA response time" },
  ],
};
const displayValue = (value: unknown) =>
  Array.isArray(value) ? value.join(", ") : String(value ?? "—");

export const CompanyDetailHero: React.FC<CompanyDetailHeroProps> = ({
  company,
  onUpdateCompany,
}) => {
  const [draft, setDraft] = useState<Company>(company);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("contact");
  const [confirmAction, setConfirmAction] = useState<"save" | "cancel" | null>(
    null,
  );
  useEffect(() => setDraft(company), [company]);

  const updateField = (key: keyof Company, value: string) =>
    setDraft((current) => ({
      ...current,
      [key]:
        key === "activeContracts" || key === "activeTickets"
          ? Number(value)
          : key === "subscribedServices"
            ? value
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean)
            : value,
    }));
  const finishAction = () => {
    if (confirmAction === "save") {
      onUpdateCompany(draft);
    } else if (confirmAction === "cancel") setDraft(company);
    setConfirmAction(null);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-slate-900 p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-white">{company.name}</h1>
        <div className="mt-5 border-b border-slate-200" />
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {[
            ["Account tier", company.tier],
            ["Account manager", company.accountManager],
            ["SLA response time", company.slaResponseTime],
            ["Primary contact", company.contactName],
            ["Active contracts", company.activeContracts],
            ["Active tickets", company.activeTickets],
          ].map(([label, value]) => (
            <div key={label}>
              <p className="text-[10px] font-semibold tracking-wide text-white uppercase">
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
              Company details
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Review and manage the complete company profile.
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
                onClick={() => setConfirmAction("cancel")}
                className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setConfirmAction("save")}
                className="rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
              >
                Save
              </button>
            </div>
          )}
        </div>
        <div className="mt-5 flex flex-wrap gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold ${activeTab === tab.id ? "bg-slate-900 text-white" : "text-slate-500 hover:bg-slate-100"}`}
            >
              <span className="material-symbols-outlined text-[16px]">
                {tab.icon}
              </span>
              {tab.label}
            </button>
          ))}
        </div>
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {fields[activeTab].map((field) => (
            <label
              key={field.key}
              className="text-xs font-semibold text-slate-500"
            >
              {field.label}
              {isEditing && !field.readOnly ? (
                <input
                  type={field.type || "text"}
                  value={displayValue(draft[field.key])}
                  onChange={(event) =>
                    updateField(field.key, event.target.value)
                  }
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              ) : (
                <span className="mt-2 block rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm font-normal text-slate-700">
                  {displayValue(draft[field.key])}
                </span>
              )}
            </label>
          ))}
        </div>
      </section>
      {confirmAction && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-900">
              {confirmAction === "save" ? "Save changes?" : "Discard changes?"}
            </h3>
            <p className="mt-2 text-sm text-slate-500">
              {confirmAction === "save"
                ? "Your company details will be updated."
                : "Your unsaved changes will be lost."}
            </p>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100"
              >
                Go back
              </button>
              <button
                type="button"
                onClick={finishAction}
                className={`rounded-lg px-3 py-2 text-sm font-semibold text-white ${confirmAction === "save" ? "bg-indigo-600 hover:bg-indigo-700" : "bg-red-600 hover:bg-red-700"}`}
              >
                {confirmAction === "save" ? "Save changes" : "Discard"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
