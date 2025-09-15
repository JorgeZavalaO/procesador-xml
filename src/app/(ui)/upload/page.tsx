"use client";

import { useEffect, useRef, useState } from "react";
import * as Comlink from "comlink";
import { getDB, DBSchema } from "@/lib/db/indexeddb";
import { seedCatalogsOnce } from "@/lib/catalogs/seeder";
import { toast } from "sonner";
import { UploadDropzone } from "@/components/uploader/UploadDropzone";
import { IDBPTransaction } from "idb";
import type { MappedDoc } from '@/lib/parser/ubl-mapper';
import { objectStoreFromTx, toRec } from '@/lib/utils';

type Party = { ruc?: string; docType?: string; docNumber?: string; [k: string]: unknown };

// OJO: usa ruta relativa para el worker (ajusta si mueves este archivo)
const workerUrl = new URL("../../../workers/parser.worker.ts", import.meta.url);

// Usamos el tipo MappedDoc importado del mapper

export default function UploadPage() {
  const workerRef = useRef<Worker | undefined>(undefined);
  const [processing, setProcessing] = useState(false);
  const [stats, setStats] = useState<{ queued: number; inserted: number; duplicates: number; errors: number }>({
    queued: 0, inserted: 0, duplicates: 0, errors: 0
  });

  useEffect(() => {
    seedCatalogsOnce();
    const w = new Worker(workerUrl, { type: "module" });
    workerRef.current = w;
    return () => w.terminate();
  }, []);

  async function upsertParty(tx: IDBPTransaction<DBSchema, string[], 'readwrite'>, storeName: "issuer" | "customers", party: Party) {
    const store = objectStoreFromTx(tx, storeName);
    if (storeName === "issuer" && party?.ruc) {
      const idx = store.index("byRuc");
      const found = await idx.get(party.ruc as IDBValidKey);
      if (found) {
        // Actualizar el party existente con nueva información (como nombre)
        const updated = { ...found, ...party };
        await store.put(updated as unknown);
        return updated;
      }
    }
    if (storeName === "customers" && party?.docType && party?.docNumber) {
      const idx = store.index("byDoc");
      const found = await idx.get([party.docType as IDBValidKey, party.docNumber as IDBValidKey]);
      if (found) {
        // Actualizar el party existente con nueva información (como nombre)
        const updated = { ...found, ...party };
        await store.put(updated as unknown);
        return updated;
      }
    }
    await store.put(party as unknown);
    return party as unknown;
  }

  async function dedupeDoc(tx: IDBPTransaction<DBSchema, string[], 'readwrite'>, doc: unknown) {
  const docs = tx.objectStore("documents");
    // 1) por hash
    const byHash = docs.index("byHash");
  const dupByHash = await byHash.get((toRec(doc)?.['hash']) as IDBValidKey);
    if (dupByHash) return true;

    // 2) por (tipo, serie, numero) + RUC emisor
    const bySN = docs.index("bySerieNum");
    const sameSN = await bySN.getAll([ (toRec(doc)?.['tipo']) as IDBValidKey, (toRec(doc)?.['serie']) as IDBValidKey, (toRec(doc)?.['numero']) as IDBValidKey ]);
    const clash = sameSN.find((d) => {
      const dIssuer = toRec(d)?.['issuer'] as Record<string, unknown> | undefined;
      const docIssuer = toRec(doc)?.['issuer'] as Record<string, unknown> | undefined;
      const dRuc = dIssuer?.['ruc'];
      const docRuc = docIssuer?.['ruc'];
      return dRuc && docRuc && dRuc === docRuc;
    });
    return Boolean(clash);
  }

  async function saveBatch(mapped: MappedDoc[]) {
    const db = await getDB();
    const tx = db.transaction(["issuer","customers","documents","lines","taxes","errors","batches"], "readwrite");
    let inserted = 0, duplicates = 0, errors = 0;

    for (const item of mapped) {
      try {
        // Upsert parties para reusar datos en stores auxiliares
  const issuer = await upsertParty(tx as IDBPTransaction<DBSchema, string[], 'readwrite'>, "issuer", item.document.issuer as Party);
  const customer = await upsertParty(tx as IDBPTransaction<DBSchema, string[], 'readwrite'>, "customers", item.document.customer as Party);

        // Embebe los parties (tu índice byIssuer usa issuer.ruc dentro del documento)
  const docRecord = { ...item.document, issuer, customer };

  const isDup = await dedupeDoc(tx as IDBPTransaction<DBSchema, string[], 'readwrite'>, docRecord);
        if (isDup) { duplicates++; continue; }

        await tx.objectStore("documents").put(docRecord);
        for (const ln of item.lines) {
          await tx.objectStore("lines").put(ln);
        }
        for (const t of item.taxes) {
          await tx.objectStore("taxes").put(t);
        }
        inserted++;
      } catch (e) {
        errors++;
        await tx.objectStore("errors").put({
          id: crypto.randomUUID(),
          filename: item.document?.storageName ?? "",
          code: "INGEST_ERROR",
          detail: (e as Error).message,
          createdAt: new Date().toISOString(),
        });
      }
    }

    await tx.done;
    setStats(s => ({ ...s, inserted: s.inserted + inserted, duplicates: s.duplicates + duplicates, errors: s.errors + errors }));
    toast.success(`Insertados: ${inserted} · Duplicados: ${duplicates} · Errores: ${errors}`);
  }

  async function onFiles(files: File[]) {
    if (!workerRef.current) return;
    setProcessing(true);
    setStats({ queued: files.length, inserted: 0, duplicates: 0, errors: 0 });

  const api = Comlink.wrap<{ processFiles: (f: File[]) => Promise<MappedDoc[]> }>(workerRef.current);
  const mapped = await api.processFiles(files) as MappedDoc[]; // Array<MappedDoc>
    await saveBatch(mapped);

    setProcessing(false);
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-semibold">Cargar XML/ZIP (SUNAT UBL 2.1)</h1>
      <UploadDropzone disabled={processing} onFiles={onFiles} />
      <div className="text-sm text-muted-foreground">
        {processing ? "Procesando..." : "Listo"} · Cargados: {stats.queued} · Insertados: {stats.inserted} · Duplicados: {stats.duplicates} · Errores: {stats.errors}
      </div>
    </div>
  );
}
