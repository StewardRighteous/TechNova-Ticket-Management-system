import React, { useEffect, useState } from "react";
import type { Employee, Ticket } from "../../types";

interface EmployeeDetailHeroProps {
  employee: Employee;
  tickets: Ticket[];
  onBack: () => void;
  onUpdateEmployee: (updates: Partial<Employee>) => void;
}
type Tab = "profile" | "work";
const fields: Record<
  Tab,
  { key: keyof Employee; label: string; type?: string; readOnly?: boolean }[]
> = {
  profile: [
    { key: "id", label: "Employee ID", readOnly: true },
    { key: "name", label: "Full name" },
    { key: "role", label: "Role" },
    { key: "roleTitle", label: "Role title" },
    { key: "email", label: "Email", type: "email" },
    { key: "phone", label: "Phone", type: "tel" },
    { key: "avatar", label: "Avatar icon" },
  ],
  work: [
    { key: "departmentId", label: "Department" },
    { key: "teamId", label: "Team" },
    { key: "locationId", label: "Location" },
    { key: "status", label: "Status" },
    { key: "capacityMax", label: "Maximum capacity", type: "number" },
    {
      key: "activeTicketsCount",
      label: "Assigned tickets",
      type: "number",
      readOnly: true,
    },
    { key: "skills", label: "Skills" },
    { key: "permissions", label: "Permissions" },
  ],
};
const textValue = (value: unknown) =>
  Array.isArray(value) ? value.join(", ") : String(value ?? "—");

export const EmployeeDetailHero: React.FC<EmployeeDetailHeroProps> = ({
  employee,
  tickets: _tickets,
  onUpdateEmployee,
}) => {
  const [draft, setDraft] = useState<Employee>(employee);
  const [editing, setEditing] = useState(false);
  const [tab, setTab] = useState<Tab>("profile");
  const [confirmation, setConfirmation] = useState<"save" | "cancel" | null>(
    null,
  );
  useEffect(() => setDraft(employee), [employee]);
  const updateField = (key: keyof Employee, value: string) =>
    setDraft((current) => ({
      ...current,
      [key]:
        key === "capacityMax"
          ? Number(value)
          : key === "skills" || key === "permissions"
            ? value
                .split(",")
                .map((item) => item.trim())
                .filter(Boolean)
            : value,
    }));
  const completeAction = () => {
    if (confirmation === "save") onUpdateEmployee(draft);
    else if (confirmation === "cancel") setDraft(employee);
    setConfirmation(null);
    setEditing(false);
  };
  const summary = [
    ["Role", employee.roleTitle],
    ["Email", employee.email],
    ["Phone", employee.phone],
    ["Status", employee.status],
    ["Department", employee.departmentId || "Not assigned"],
    ["Capacity", `${employee.activeTicketsCount} / ${employee.capacityMax}`],
  ];
  return (
    <div className="space-y-6">
      <section className="rounded-2xl bg-slate-900 p-6 text-white shadow-lg sm:p-8">
        <div className="flex flex-col gap-5 border-b border-slate-700 pb-6 lg:flex-row lg:items-start lg:justify-between">
          <h1 className="text-2xl font-bold sm:text-3xl">{employee.name}</h1>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {summary.map(([label, value]) => (
            <div key={label}>
              <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase">
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
              Employee details
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Review and manage the complete employee profile.
            </p>
          </div>
          {!editing ? (
            <button
              type="button"
              onClick={() => setEditing(true)}
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
        <div className="mt-5 flex gap-2">
          {(["profile", "work"] as Tab[]).map((item) => (
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
              {editing && !field.readOnly ? (
                <input
                  type={field.type || "text"}
                  value={textValue(draft[field.key])}
                  onChange={(event) =>
                    updateField(field.key, event.target.value)
                  }
                  className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm font-normal text-slate-800 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
                />
              ) : (
                <span className="mt-2 block rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5 text-sm font-normal text-slate-700">
                  {textValue(draft[field.key])}
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
                ? "Your employee details will be updated."
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
                className={`rounded-lg px-3 py-2 text-sm font-semibold text-white ${confirmation === "save" ? "bg-indigo-600 hover:bg-indigo-700" : "bg-rose-600 hover:bg-rose-700"}`}
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
