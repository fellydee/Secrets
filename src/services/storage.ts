import { DiaryEntry, SecuritySettings } from '../types/diary';

const ENTRIES_KEY = 'secretlogs_entries_v1';
const SETTINGS_KEY = 'secretlogs_security_settings_v1';

const INITIAL_SETTINGS: SecuritySettings = {
  isLockEnabled: false, // User can enable PIN or Biometrics anytime
  isBiometricsEnabled: false,
  biometricCredentialId: null,
  isPinEnabled: false,
  pinHash: null,
  autoLockMinutes: 5,
  lastActiveTimestamp: Date.now(),
  stealthMode: false,
  fakeDecoyPinHash: null,
};

const SAMPLE_ENTRY_IDS = new Set(['entry-welcome-1', 'entry-reflection-2', 'entry-reflection-3']);

const INITIAL_ENTRIES: DiaryEntry[] = [];

export function getStoredEntries(): DiaryEntry[] {
  try {
    const raw = localStorage.getItem(ENTRIES_KEY);
    if (!raw) {
      localStorage.setItem(ENTRIES_KEY, JSON.stringify(INITIAL_ENTRIES));
      return INITIAL_ENTRIES;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Remove mock/sample starter entries so new users have a clean slate
      const cleaned = parsed.filter(item => item && !SAMPLE_ENTRY_IDS.has(item.id));
      if (cleaned.length !== parsed.length) {
        localStorage.setItem(ENTRIES_KEY, JSON.stringify(cleaned));
      }
      return cleaned;
    }
    return INITIAL_ENTRIES;
  } catch (err) {
    console.error('Error reading entries from localStorage', err);
    return INITIAL_ENTRIES;
  }
}

export function saveStoredEntries(entries: DiaryEntry[]): void {
  try {
    localStorage.setItem(ENTRIES_KEY, JSON.stringify(entries));
  } catch (err) {
    console.error('Error saving entries to localStorage', err);
  }
}

export function getStoredSecuritySettings(): SecuritySettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(INITIAL_SETTINGS));
      return INITIAL_SETTINGS;
    }
    return { ...INITIAL_SETTINGS, ...JSON.parse(raw) };
  } catch (err) {
    console.error('Error reading security settings', err);
    return INITIAL_SETTINGS;
  }
}

export function saveStoredSecuritySettings(settings: SecuritySettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.error('Error saving security settings', err);
  }
}

export function createOrUpdateEntry(entry: DiaryEntry): DiaryEntry[] {
  const current = getStoredEntries();
  const index = current.findIndex(e => e.id === entry.id);
  let updated: DiaryEntry[];

  if (index >= 0) {
    updated = [...current];
    updated[index] = { ...entry, updatedAt: new Date().toISOString() };
  } else {
    updated = [entry, ...current];
  }

  saveStoredEntries(updated);
  return updated;
}

export function deleteStoredEntry(id: string): DiaryEntry[] {
  const current = getStoredEntries();
  const updated = current.filter(e => e.id !== id);
  saveStoredEntries(updated);
  return updated;
}

export function toggleStoredFavorite(id: string): DiaryEntry[] {
  const current = getStoredEntries();
  const updated = current.map(e => e.id === id ? { ...e, isFavorite: !e.isFavorite } : e);
  saveStoredEntries(updated);
  return updated;
}

export function exportBackupJSON(): string {
  const entries = getStoredEntries();
  const settings = getStoredSecuritySettings();
  const backup = {
    app: 'SecretLogs',
    version: '1.0.0',
    exportedAt: new Date().toISOString(),
    entriesCount: entries.length,
    entries,
    security: {
      isPinEnabled: settings.isPinEnabled,
      isBiometricsEnabled: settings.isBiometricsEnabled,
      autoLockMinutes: settings.autoLockMinutes,
    }
  };
  return JSON.stringify(backup, null, 2);
}

export function importBackupJSON(jsonStr: string): { success: boolean; count?: number; error?: string } {
  try {
    const parsed = JSON.parse(jsonStr);
    if (!parsed || !Array.isArray(parsed.entries)) {
      return { success: false, error: 'Invalid backup file format' };
    }
    const current = getStoredEntries();
    // Merge without duplicates by id
    const existingIds = new Set(current.map(e => e.id));
    const merged = [...current];
    let addedCount = 0;

    for (const item of parsed.entries) {
      if (item.id && !existingIds.has(item.id)) {
        merged.push(item);
        existingIds.add(item.id);
        addedCount++;
      }
    }

    // Sort descending by date
    merged.sort((a, b) => new Date(b.date + ' ' + (b.time || '00:00')).getTime() - new Date(a.date + ' ' + (a.time || '00:00')).getTime());
    saveStoredEntries(merged);
    return { success: true, count: addedCount };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to parse JSON backup' };
  }
}

export function wipeAllLocalData(): void {
  try {
    localStorage.removeItem(SETTINGS_KEY);
    localStorage.setItem(ENTRIES_KEY, JSON.stringify([]));
  } catch (err) {
    console.error('Error wiping local data', err);
  }
}

