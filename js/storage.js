import { createDefaultData } from './defaultData.js';

const STORAGE_KEY = 'dearlog_v2_data';

export function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const data = createDefaultData();
      saveData(data);
      return data;
    }
    const parsed = JSON.parse(raw);
    return {
      subjects: parsed.subjects ?? [],
      missions: parsed.missions ?? [],
      studyItems: parsed.studyItems ?? [],
      metaLogs: parsed.metaLogs ?? [],
      settings: parsed.settings ?? {
       praiseMode: "normal",
       roleMode: "englishTeacher"
      }
    };
  } catch {
    const data = createDefaultData();
    saveData(data);
    return data;
  }
}

export function saveData(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function exportData(data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `dearlog-backup-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export async function importData(file) {
  const text = await file.text();
  const parsed = JSON.parse(text);
  saveData(parsed);
  return parsed;
}

export function resetData() {
  localStorage.removeItem(STORAGE_KEY);
  const fresh = createDefaultData();
  saveData(fresh);
  return fresh;
}
