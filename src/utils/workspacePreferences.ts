export type DefaultTicketView = "all" | "mine" | "urgent";

export interface WorkspacePreferences {
  defaultView: DefaultTicketView;
  compactMode: boolean;
}

const DEFAULT_PREFERENCES: WorkspacePreferences = {
  defaultView: "all",
  compactMode: false,
};

function preferenceKey(personaId: string): string {
  return `technova_workspace_preferences_v1:${personaId}`;
}

export function loadWorkspacePreferences(personaId: string | null | undefined): WorkspacePreferences {
  if (!personaId) return DEFAULT_PREFERENCES;
  try {
    const stored = localStorage.getItem(preferenceKey(personaId));
    if (!stored) return DEFAULT_PREFERENCES;
    const parsed = JSON.parse(stored) as Partial<WorkspacePreferences>;
    return {
      defaultView: parsed.defaultView === "mine" || parsed.defaultView === "urgent" ? parsed.defaultView : "all",
      compactMode: parsed.compactMode === true,
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function saveWorkspacePreferences(personaId: string | null | undefined, preferences: WorkspacePreferences): boolean {
  if (!personaId) return false;
  try {
    localStorage.setItem(preferenceKey(personaId), JSON.stringify(preferences));
    window.dispatchEvent(new CustomEvent("technova-preferences-updated", { detail: { personaId } }));
    return true;
  } catch {
    return false;
  }
}
