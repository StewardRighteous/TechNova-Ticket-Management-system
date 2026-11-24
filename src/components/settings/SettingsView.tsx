import { SettingRow, Switch, ConfirmationDialog, Button, Heading, Icon } from "../../ui/barrel";
import React, { useState } from "react";
import { useTicketStore } from "../../store/barrel";
import { loadWorkspacePreferences, saveWorkspacePreferences, type WorkspacePreferences } from "../../utils/workspacePreferences";
import { SelectDropdown } from "../../ui/groups/SelectDropdown";

export const SettingsView: React.FC = () => {
  const { resetDemoData, addToast, currentUser, data } = useTicketStore();
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
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
          <Heading variant="plain" className="text-xs font-bold tracking-wider text-slate-500 uppercase">
            Notifications
          </Heading>
        </div>
        <p className="px-5 py-5 text-sm leading-6 text-slate-600">This local demo has no email delivery or browser push service. Ticket alerts appear in the in-app notification bell and Notifications page.</p>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-3">
          <Heading variant="plain" className="text-xs font-bold tracking-wider text-slate-500 uppercase">
            Ticket workspace
          </Heading>
        </div>
        <div className="divide-y divide-slate-100">
          <SettingRow
            title="Default ticket view"
            description="Choose which ticket set opens first when you visit the ticket registry."
          >
            <SelectDropdown
              label="Default ticket view"
              value={settings.defaultView}
              onChange={(value) => updatePreferences({ ...settings, defaultView: value as WorkspacePreferences["defaultView"] })}
              options={[{ value: "all", label: "All tickets" }, { value: "mine", label: "My tickets" }, { value: "urgent", label: "Urgent tickets" }]}
              className="w-48"
            />
          </SettingRow>
          <SettingRow
            title="Refresh interval"
            description="Ticket data is stored in this browser and does not sync with a server. Refresh the page to reload its saved data."
          >
            <SelectDropdown label="Refresh behavior" value="manual" onChange={() => undefined} options={[{ value: "manual", label: "Manual only" }]} disabled className="w-48" />
          </SettingRow>
          <SettingRow
            title="Compact layout"
            description="Use a denser layout to fit more ticket information on screen."
          >
            <Switch
              checked={settings.compactMode}
              label="Toggle compact layout"
              onChange={() => updatePreferences({ ...settings, compactMode: !settings.compactMode })}
            />
          </SettingRow>
        </div>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 bg-slate-50/70 px-5 py-3">
          <Heading variant="plain" className="text-xs font-bold tracking-wider text-slate-500 uppercase">
            Regional
          </Heading>
        </div>
        <SettingRow
          title="Language"
          description="This demo is currently available in English (US). Language switching is not configured."
        >
          <SelectDropdown label="Workspace language" value="english" onChange={() => undefined} options={[{ value: "english", label: "English (US)" }]} disabled className="w-48" />
        </SettingRow>
      </section>

      <section className="overflow-hidden rounded-2xl border border-rose-200 bg-white shadow-sm">
        <div className="border-b border-rose-100 bg-rose-50/70 px-5 py-3">
          <Heading variant="plain" className="text-xs font-bold tracking-wider text-rose-700 uppercase">
            Client Presentation Demo Controls
          </Heading>
        </div>
        <div className="divide-y divide-rose-100">
          <SettingRow
            title="Reset Demo Data"
            description="This replaces locally saved tickets, companies, employees, services, and notification changes with the original demo records."
          >
            <Button tone="plain"
              type="button"
              onClick={() => setIsResetConfirmOpen(true)}
              className="flex items-center gap-2 rounded-lg border border-rose-300 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-800 transition hover:bg-rose-100 focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              <Icon aria-hidden="true" className="text-[16px]">restart_alt</Icon>
              <span>Reset to Seed Data</span>
            </Button>
          </SettingRow>
        </div>
      </section>
      {isResetConfirmOpen && <ConfirmationDialog
        title="Reset all demo data?"
        description="This permanently replaces this browser’s saved demo changes with the original tickets, companies, employees, services, and notifications. This action cannot be undone."
        confirmLabel="Reset demo data"
        onCancel={() => setIsResetConfirmOpen(false)}
        onConfirm={confirmReset}
        danger
      />}
    </div>
  );
};
