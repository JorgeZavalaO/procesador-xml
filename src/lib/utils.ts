// Helpers para trabajar con objetos parseados (unknown) y evitar casts repetidos
export const toRec = (x: unknown): Record<string, unknown> | undefined => {
  if (x == null) return undefined;
  return typeof x === 'object' ? (x as Record<string, unknown>) : undefined;
};

export const getAny = (obj: unknown, key: string): unknown => {
  return toRec(obj)?.[key];
};

export const getRec = (obj: unknown, key: string): Record<string, unknown> | undefined => {
  return toRec(obj)?.[key] as Record<string, unknown> | undefined;
};

export const asArray = <T = unknown>(x: unknown): T[] => {
  if (x == null) return [];
  if (Array.isArray(x)) return x as T[];
  return [x as T];
};

export const objectStoreFromTx = (tx: unknown, name: string) => {
  // IDB typings are sometimes awkward in TS; accept unknown and cast internally
  const t = tx as IDBTransaction;
  return t.objectStore(name as unknown as string);
};

export const idbKey = (v: unknown): IDBValidKey | undefined => {
  if (v == null) return undefined;
  if (typeof v === 'string' || typeof v === 'number' || typeof v === 'boolean') return v as IDBValidKey;
  return undefined;
};
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
