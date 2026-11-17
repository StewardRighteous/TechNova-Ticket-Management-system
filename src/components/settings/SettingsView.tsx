import React, { useState } from "react";
import { useTicketStore } from "../../store/barrel";

interface ToggleProps {
  checked: boolean;
  label: string;
  onChange: () => void;
}

const Toggle: React.FC<ToggleProps> = ({ checked, label, onChange }) => (
  <button
    aria-label={label}
    aria-pressed={checked}
    className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:outline-none ${checked ? "bg-indigo-600" : "bg-slate-300"}`}
    onClick={onChange}
    type="button"
  >
    <span
      className={`inline-block size-4 rounded-full bg-white shadow-sm transition-transform ${checked ? "translate-x-6" : "translate-x-1"}`}
    />
  </button>
);

interface SettingRowProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

const SettingRow: React.FC<SettingRowProps> = ({
  title,
  description,
  children,
}) => (
  <div className="flex flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
    <div className="max-w-2xl">
      <h3 className="text-sm font-bold text-slate-900">{title}</h3>
      <p className="mt-1 text-sm leading-5 text-slate-500">{description}</p>
    </div>
    <div className="flex shrink-0 items-center sm:pl-8">{children}</div>
  </div>
);

export const SettingsView: React.FC = () => {
  const { resetDemoData, addToast } = useTicketStore();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    browserNotifications: false,
    compactMode: false,
    defaultView: "all",
    refreshInterval: "5",
    language: "english",
  });

  const toggle = (
    key: "emailNotifications" | "browserNotifications" | "compactMode",
  ) => setSettings((current) => ({ ...current, [key]: !current[key] }));

  const updateSelect = (
    key: "defaultView" | "refreshInterval" | "language",
    value: string,
  ) => setSettings((current) => ({ ...current, [key]: value }));

  const selectClass =
    "rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

  return (
    <div className="space-y-6 p-6 sm:p-8">
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-3">
          <h2 className="text-xs font-bold tracking-wider text-slate-500 uppercase">
            Notifications
          </h2>
        </div>
        <div className="divide-y divide-slate-100">
          <SettingRow
            title="Email notifications"
            description="Receive updates when tickets are assigned to you or change status."
          >
            <Toggle
              checked={settings.emailNotifications}
              label="Toggle email notifications"
              onChange={() => toggle("emailNotifications")}
            />
          </SettingRow>
          <SettingRow
            title="Browser notifications"
            description="Show an in-app alert for urgent tickets and new mentions."
          >
            <Toggle
              checked={settings.browserNotifications}
              label="Toggle browser notifications"
              onChange={() => toggle("browserNotifications")}
            />
          </SettingRow>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-3">
          <h2 className="text-xs font-bold tracking-wider text-slate-500 uppercase">
            Ticket workspace
          </h2>
        </div>
        <div className="divide-y divide-slate-100">
          <SettingRow
            title="Default ticket view"
            description="Choose which ticket set opens first when you visit the ticket registry."
          >
            <select
              aria-label="Default ticket view"
              className={selectClass}
              onChange={(event) =>
                updateSelect("defaultView", event.target.value)
              }
              value={settings.defaultView}
            >
              <option value="all">All tickets</option>
              <option value="mine">My tickets</option>
              <option value="urgent">Urgent tickets</option>
            </select>
          </SettingRow>
          <SettingRow
            title="Refresh interval"
            description="Control how often the ticket list checks for new activity."
          >
            <select
              aria-label="Refresh interval"
              className={selectClass}
              onChange={(event) =>
                updateSelect("refreshInterval", event.target.value)
              }
              value={settings.refreshInterval}
            >
              <option value="1">Every minute</option>
              <option value="5">Every 5 minutes</option>
              <option value="15">Every 15 minutes</option>
              <option value="manual">Manual only</option>
            </select>
          </SettingRow>
          <SettingRow
            title="Compact layout"
            description="Use a denser layout to fit more ticket information on screen."
          >
            <Toggle
              checked={settings.compactMode}
              label="Toggle compact layout"
              onChange={() => toggle("compactMode")}
            />
          </SettingRow>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-3">
          <h2 className="text-xs font-bold tracking-wider text-slate-500 uppercase">
            Regional
          </h2>
        </div>
        <SettingRow
          title="Language"
          description="Set the language used for labels and navigation in the workspace."
        >
          <select
            aria-label="Language"
            className={selectClass}
            onChange={(event) => updateSelect("language", event.target.value)}
            value={settings.language}
          >
            <option value="english">English (US)</option>
            <option value="english-uk">English (UK)</option>
          </select>
        </SettingRow>
      </section>

      <section className="overflow-hidden rounded-2xl border border-rose-200 bg-white shadow-sm">
        <div className="border-b border-rose-100 bg-rose-50/70 px-5 py-3">
          <h2 className="text-xs font-bold tracking-wider text-rose-700 uppercase">
            Client Presentation Demo Controls
          </h2>
        </div>
        <div className="divide-y divide-rose-100">
          <SettingRow
            title="Reset Demo Data"
            description="Restore all tickets, companies, employees, and services back to pristine mockup seed data."
          >
            <button
              type="button"
              onClick={() => {
                resetDemoData();
                addToast("All demo data has been reset to pristine seed records.", "success");
              }}
              className="flex items-center gap-2 rounded-lg border border-rose-300 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 transition hover:bg-rose-100 focus:outline-none focus:ring-2 focus:ring-rose-500 focus:ring-offset-2"
            >
              <span className="material-symbols-outlined text-[16px]">restart_alt</span>
              <span>Reset to Seed Data</span>
            </button>
          </SettingRow>
        </div>
      </section>
    </div>
  );
};
