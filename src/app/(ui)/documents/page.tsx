"use client";
import { useEffect, useState } from "react";
import { getDB } from "@/lib/db/indexeddb";
import { DocumentCard } from "@/components/documents/DocumentCard";
import type { MappedDoc } from '@/lib/parser/ubl-mapper';

export default function DocumentsPage() {
  const [docs, setDocs] = useState<MappedDoc['document'][]>([]);
  const [loading, setLoading] = useState(true);

  const loadDocs = async () => {
    const db = await getDB();
    const tx = db.transaction("documents");
    const all = await tx.store.getAll() as MappedDoc['document'][];
    setDocs(all.slice(-100).reverse());
  };

  useEffect(() => {
    (async () => {
      await loadDocs();
      setLoading(false);
    })();
  }, []);

  const handleDelete = async (docId: string) => {
    if (!confirm("¿Estás seguro de que quieres eliminar este documento?")) return;
    try {
      const db = await getDB();
      const tx = db.transaction(["documents", "lines", "taxes"], "readwrite");
      await tx.objectStore("documents").delete(docId);
      await tx.objectStore("lines").delete(docId); // Asumiendo que lines usa documentId como key? No, lines tiene key 'id', pero index 'byDocument'
      // Para eliminar líneas, usar index
      const linesStore = tx.objectStore("lines");
      const linesIndex = linesStore.index("byDocument");
      const linesToDelete = await linesIndex.getAll(docId);
      for (const line of linesToDelete) {
        await linesStore.delete(line.id);
      }
      const taxesStore = tx.objectStore("taxes");
      const taxesIndex = taxesStore.index("byDocument");
      const taxesToDelete = await taxesIndex.getAll(docId);
      for (const tax of taxesToDelete) {
        await taxesStore.delete(tax.id);
      }
      await tx.done;
      await loadDocs(); // Refrescar la lista
    } catch (error) {
      alert("Error al eliminar el documento: " + (error as Error).message);
    }
  };

  return (
    <div className="mx-auto max-w-screen-2xl p-4 sm:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Documentos procesados</h1>
        <div className="text-sm text-muted-foreground">
          {loading ? "Cargando…" : `${docs.length} documento${docs.length === 1 ? "" : "s"}`}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-80 rounded-xl border animate-pulse bg-muted/30" />
          ))}
        </div>
      ) : docs.length ? (
        <div className="grid grid-cols-1 gap-4">
          {docs.map((d) => (
            <DocumentCard key={d.id} doc={d} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <p className="text-muted-foreground mt-4">
          Sin datos aún. Sube XML/ZIP en <span className="font-medium">/upload</span>.
        </p>
      )}
    </div>
  );
}