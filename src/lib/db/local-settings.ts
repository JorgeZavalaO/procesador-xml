export const settings = {
  get<T>(key: string, fallback: T): T {
    try { return JSON.parse(localStorage.getItem(key) ?? "") ?? fallback; }
    catch { return fallback; }
  },
  set<T>(key: string, value: T) { localStorage.setItem(key, JSON.stringify(value)); }
};
