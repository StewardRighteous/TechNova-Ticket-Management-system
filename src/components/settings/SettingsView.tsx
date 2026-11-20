import React, { useState } from "react";
import { useTicketStore } from "../../store/barrel";
import { loadWorkspacePreferences, saveWorkspacePreferences, type WorkspacePreferences } from "../../utils/workspacePreferences";

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
  const { resetDemoData, addToast, currentUser, data } = useTicketStore();
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const resetTriggerRef = React.useRef<HTMLButtonElement>(null);
  const cancelResetRef = React.useRef<HTMLButtonElement>(null);
  const [settings, setSettings] = useState<WorkspacePreferences>(() => loadWorkspacePreferences(currentUser?.id));
  const [preferencesSaved, setPreferencesSaved] = useState(true);

  React.useEffect(() => {
    setSettings(loadWorkspacePreferences(currentUser?.id));
    setPreferencesSaved(true);
  }, [currentUser?.id]);

  const updatePreferences = (next: WorkspacePreferences) => {
    setSettings(next);
    setPreferencesSaved(saveWorkspacePreferences(currentUser?.id, next));
  };

  const selectClass =
    "rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100";

  React.useEffect(() => {
    if (!isResetConfirmOpen) return;
    cancelResetRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsResetConfirmOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isResetConfirmOpen]);

  React.useEffect(() => {
    if (!isResetConfirmOpen) resetTriggerRef.current?.focus();
  }, [isResetConfirmOpen]);

  const confirmReset = () => {
    const activePersonaExistsInSeed = data.employees.some((employee) => employee.id === currentUser?.id);
    resetDemoData();
    addToast(
      activePersonaExistsInSeed
        ? "Demo data restored. Your active persona was preserved."
        : "Demo data restored. Your previous persona was removed, so you are now using the default demo persona.",
      activePersonaExistsInSeed ? "success" : "warning",
    );
    setIsResetConfirmOpen(false);
  };

  return (
    <div className="space-y-6 p-6 sm:p-8">
      <p className="sr-only" aria-live="polite">{preferencesSaved ? "Preferences saved for this persona." : "Preferences could not be saved in this browser."}</p>
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-3">
          <h2 className="text-xs font-bold tracking-wider text-slate-500 uppercase">
            Notifications
          </h2>
        </div>
        <p className="px-5 py-5 text-sm leading-6 text-slate-600">This local demo has no email delivery or browser push service. Ticket alerts appear in the in-app notification bell and Notifications page.</p>
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
              onChange={(event) => updatePreferences({ ...settings, defaultView: event.target.value as WorkspacePreferences["defaultView"] })}
              value={settings.defaultView}
            >
              <option value="all">All tickets</option>
              <option value="mine">My tickets</option>
              <option value="urgent">Urgent tickets</option>
            </select>
          </SettingRow>
          <SettingRow
            title="Refresh interval"
            description="Ticket data is stored in this browser and does not sync with a server. Refresh the page to reload its saved data."
          >
            <select
              aria-label="Refresh behavior"
              className={selectClass}
              onChange={() => undefined}
              value="manual"
              disabled
            >
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
              onChange={() => updatePreferences({ ...settings, compactMode: !settings.compactMode })}
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
          description="This demo is currently available in English (US). Language switching is not configured."
        >
          <select
            aria-label="Workspace language"
            className={selectClass}
            onChange={() => undefined}
            value="english"
            disabled
          >
            <option value="english">English (US)</option>
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
            description="This replaces locally saved tickets, companies, employees, services, and notification changes with the original demo records."
          >
            <button
              ref={resetTriggerRef}
              type="button"
              onClick={() => setIsResetConfirmOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-rose-300 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-800 transition hover:bg-rose-100 focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <span aria-hidden="true" className="material-symbols-outlined text-[16px]">restart_alt</span>
              <span>Reset to Seed Data</span>
            </button>
          </SettingRow>
        </div>
      </section>
      {isResetConfirmOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/35 p-4" onMouseDown={(event) => { if (event.target === event.currentTarget) setIsResetConfirmOpen(false); }}>
          <section aria-labelledby="reset-demo-title" aria-describedby="reset-demo-description" aria-modal="true" className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-4 shadow-xl" role="dialog">
            <div className="flex items-start gap-4">
              <span aria-hidden="true" className="material-symbols-outlined flex size-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">warning</span>
              <div>
                <h2 className="text-base font-bold text-slate-950" id="reset-demo-title">Reset all demo data?</h2>
                <p className="mt-1.5 text-sm leading-5 text-slate-600" id="reset-demo-description">This permanently replaces this browser’s saved demo changes with the original tickets, companies, employees, services, and notifications. This action cannot be undone.</p>
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button ref={cancelResetRef} type="button" onClick={() => setIsResetConfirmOpen(false)} className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 focus-visible:outline-none">Cancel</button>
              <button type="button" onClick={confirmReset} className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-semibold text-white hover:bg-slate-800 focus-visible:ring-2 focus-visible:ring-slate-500 focus-visible:ring-offset-2 focus-visible:outline-none">Reset demo data</button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};
