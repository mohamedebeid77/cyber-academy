import type { AppData } from '../types';

/** Local-storage keys are per academy so progress never mixes. */
export const STORAGE_KEYS = {
  android: 'android-pentesting-academy.v1',
  network: 'network-pentesting-academy.v1'
} as const;

export function defaultData(): AppData {
  return {
    version: 1,
    progress: {
      lessons: {},
      labs: {},
      ctf: {},
      xp: 0,
      badges: [],
      activityDays: [],
      studyByDay: {},
      checklist: {}
    },
    notes: [],
    bookmarks: { lessons: [], labs: [], tools: [], cheatsheets: [], sources: [] },
    settings: { userName: 'Mohamed', reduceMotion: false },
    custom: {
      lessons: [],
      modules: [],
      labs: [],
      ctf: [],
      tools: [],
      cheatsheets: [],
      glossary: [],
      sources: []
    }
  };
}

export function loadData(key: string): AppData {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return defaultData();
    const parsed = JSON.parse(raw) as Partial<AppData>;
    const base = defaultData();
    return {
      version: 1,
      progress: { ...base.progress, ...(parsed.progress ?? {}) },
      notes: Array.isArray(parsed.notes) ? parsed.notes : [],
      bookmarks: { ...base.bookmarks, ...(parsed.bookmarks ?? {}) },
      settings: { ...base.settings, ...(parsed.settings ?? {}) },
      custom: { ...base.custom, ...(parsed.custom ?? {}) }
    };
  } catch {
    return defaultData();
  }
}

const saveTimers = new Map<string, ReturnType<typeof setTimeout>>();

export function saveData(key: string, data: AppData) {
  const existing = saveTimers.get(key);
  if (existing) clearTimeout(existing);
  saveTimers.set(
    key,
    setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(data));
      } catch {
        // storage full or unavailable — fail silently, app still works in-memory
      }
    }, 250)
  );
}

export function storageUsageBytes(key: string): number {
  try {
    return (localStorage.getItem(key) ?? '').length;
  } catch {
    return 0;
  }
}

export function clearStorage(key: string) {
  try {
    localStorage.removeItem(key);
  } catch {
    /* noop */
  }
}

export function downloadJson(filename: string, payload: unknown) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
