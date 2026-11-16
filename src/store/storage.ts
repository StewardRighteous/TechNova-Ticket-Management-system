import initialData from '../../mockup.json';
import type { MockupDatabase } from '../types';

export const STORAGE_KEY = 'technova_tickets_state_v1';

export function loadInitialState(): MockupDatabase {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch {
    // ignore local storage error and fall back
  }
  return initialData as MockupDatabase;
}

export function persistState(state: MockupDatabase): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // ignore
  }
}

export function resetStoredState(): MockupDatabase {
  const pristine = JSON.parse(JSON.stringify(initialData)) as MockupDatabase;
  persistState(pristine);
  return pristine;
}
