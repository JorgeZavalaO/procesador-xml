"use client";

import { useState } from "react";
import { getDB } from "@/lib/db/indexeddb";
import type { MappedDoc } from '@/lib/parser/ubl-mapper';
import {
  FileText, CalendarDays, CheckCircle2, Building2, User2, ChevronDown, ChevronUp, ListOrdered, BadgeDollarSign, Trash2
} from "lucide-react";

type Doc = MappedDoc['document'];

function normalizeCurrency(c: unknown, fallback: string = "PEN"): string {
  try {
    let code: unknown = c;
    if (c && typeof c === "object") {
      const o = c as Record<string, unknown>;
      code = o.currency ?? o.code ?? o.currencyID ?? o.value ?? o["#text"];
    }
    if (typeof code !== "string") return fallback;
    const norm = code.trim().toUpperCase();
    // Validar básico 3 letras
    if (!/^[A-Z]{3}$/.test(norm)) return fallback;
    return norm;
  } catch {
    return fallback;
  }
}

function money(n: unknown, currency: unknown = "PEN") {
  const val = typeof n === "number" ? n : Number((n as unknown) ?? 0);
  const curr = normalizeCurrency(currency, "PEN");
  try {
    return new Intl.NumberFormat("es-PE", { style: "currency", currency: curr, minimumFractionDigits: 2 }).format(val || 0);
  } catch {
    return new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN", minimumFractionDigits: 2 }).format(val || 0);
  }
}
const fdate = (s?: string) => !s ? "—" : (isNaN(new Date(s).getTime()) ? s : new Date(s).toLocaleDateString("es-PE", { day:"2-digit", month:"short", year:"numeric" }));

export function DocumentCard({ doc, onDelete }: { doc: Doc; onDelete?: (id: string) => void }) {
  const [open, setOpen] = useState(false);
  const [loadingItems, setLoadingItems] = useState(false);
  const [items, setItems] = useState<Array<MappedDoc['lines'][number]>>([]);

  async function loadItems() {
    setLoadingItems(true);
    try {
      const db = await getDB();
  const store = db.transaction("lines").store;
  const idx = store.index("byDocument");
  const rows = await idx.getAll(doc.id) as Array<MappedDoc['lines'][number]>;
  setItems(rows ?? []);
    } finally {
      setLoadingItems(false);
    }
  }

  const total = doc?.total ?? 0;
  const subtotal = doc?.subtotal ?? 0;
  const igv = doc?.totalIgv ?? 0;
  const moneda = normalizeCurrency(doc?.moneda, "PEN");
  const statusOk = true;

  const det = doc?.payment?.detraction;
  const legendMonto = (doc?.legends ?? []).find((l) => l.code === "1000");

  const tipoInfo = (() => {
    const t = doc?.tipo;
    if (t === "01") return { name: "Factura", className: "bg-blue-100 text-blue-700 border-blue-200" };
    if (t === "03") return { name: "Boleta", className: "bg-indigo-100 text-indigo-700 border-indigo-200" };
    if (t === "07") return { name: "Nota de Crédito", className: "bg-green-100 text-green-700 border-green-200" };
    if (t === "08") return { name: "Nota de Débito", className: "bg-amber-100 text-amber-700 border-amber-200" };
    return { name: "Documento", className: "bg-slate-100 text-slate-700 border-slate-200" };
  })();

  const docTitle = (doc?.serie && doc?.numero) ? `${doc.serie}-${doc.numero}` : (doc?.id ? `DOC-${doc.id}` : "Documento");

  return (
  <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden transition-all duration-200 hover:shadow-md w-full">
      {/* Header - más alto y con mejor espaciado */}
      <div className="flex items-center justify-between gap-4 p-5 border-b bg-secondary/30">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <FileText size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <span className="text-base font-semibold truncate max-w-[200px]" title={docTitle}>{docTitle}</span>
              <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-sm font-medium ${tipoInfo.className}`}>
                {tipoInfo.name}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-sm text-emerald-700">
                <CheckCircle2 size={14} /> {statusOk ? "Válido" : "Procesado"}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CalendarDays size={14} /> {fdate(doc?.issueDate)}
              {doc?.issueTime && (
                <>
                  <span>•</span>
                  <span>{doc.issueTime}</span>
                </>
              )}
            </div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-lg font-bold text-foreground">{money(total, moneda)}</div>
          <div className="text-sm text-muted-foreground">{moneda}</div>
        </div>
        {onDelete && (
          <button
            onClick={() => onDelete(doc.id)}
            className="p-2 text-muted-foreground hover:text-destructive transition rounded-lg hover:bg-destructive/10"
            title="Eliminar documento"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>

      {/* Body - mejor organización con más espaciado */}
      <div className="p-5 space-y-5">
        {/* Sección Emisor y Cliente con más espacio */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <div className="text-xs uppercase text-muted-foreground font-medium tracking-wider">Emisor</div>
            <div className="flex items-start gap-3">
              <Building2 size={18} className="mt-0.5 text-blue-600 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className={`font-semibold text-sm leading-relaxed ${doc?.issuer?.nombre ? 'text-foreground' : 'text-muted-foreground italic'}`}>
                  {doc?.issuer?.nombre || "Emisor sin nombre"}
                </div>
                <div className="text-muted-foreground text-xs mt-1">
                  {doc?.issuer?.ruc ? `RUC: ${doc.issuer.ruc}` : doc?.issuer?.docNumber ? `Doc: ${doc.issuer.docNumber}` : "Sin RUC"}
                </div>
                {doc?.issuer?.direccion && (
                  <div className="text-xs text-muted-foreground mt-1 leading-relaxed" title={doc.issuer.direccion}>
                    📍 {doc.issuer.direccion}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <div className="text-xs uppercase text-muted-foreground font-medium tracking-wider">Cliente</div>
            <div className="flex items-start gap-3">
              <User2 size={18} className="mt-0.5 text-green-600 shrink-0" />
              <div className="min-w-0 flex-1">
                <div className={`font-semibold text-sm leading-relaxed ${doc?.customer?.nombre ? 'text-foreground' : 'text-muted-foreground italic'}`}>
                  {doc?.customer?.nombre || "Cliente sin nombre"}
                </div>
                <div className="text-muted-foreground text-xs mt-1">
                  {doc?.customer?.docType && doc?.customer?.docNumber 
                    ? `${doc.customer.docType === "6" ? "RUC" : doc.customer.docType === "1" ? "DNI" : "Doc"}: ${doc.customer.docNumber}`
                    : "Sin documento"
                  }
                </div>
                {doc?.customer?.direccion && (
                  <div className="text-xs text-muted-foreground mt-1 leading-relaxed" title={doc.customer.direccion}>
                    📍 {doc.customer.direccion}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sección de Totales con más espacio */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 text-center">
            <div className="text-xs text-muted-foreground mb-2 font-medium">Subtotal</div>
            <div className="text-base font-semibold text-foreground">{money(subtotal, moneda)}</div>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-4 text-center">
            <div className="text-xs text-muted-foreground mb-2 font-medium">IGV</div>
            <div className="text-base font-semibold text-amber-700 dark:text-amber-300">{money(igv, moneda)}</div>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 text-center">
            <div className="text-xs text-muted-foreground mb-2 font-medium">Total</div>
            <div className="text-xl font-bold text-blue-700 dark:text-blue-300">{money(total, moneda)}</div>
          </div>
        </div>
      </div>

      {/* Chips: información adicional con mejor espaciado */}
      <div className="px-5 pb-4 flex flex-wrap gap-2">
        <span className="text-xs inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 bg-blue-50 border-blue-200 text-blue-700 font-medium">
          <ListOrdered size={14}/> {items?.length || 0} ítems
        </span>
        {doc?.payment?.formaPago && (
          <span className="text-xs rounded-full border px-3 py-1.5 bg-green-50 border-green-200 text-green-700 font-medium">
            💳 {doc.payment.formaPago}
          </span>
        )}
        {det && (
          <span className="text-xs inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 bg-orange-50 border-orange-200 text-orange-700 font-medium">
            <BadgeDollarSign size={14}/> Detracción {det.percent}%
          </span>
        )}
        {doc?.dueDate && (
          <span className="text-xs rounded-full border px-3 py-1.5 bg-purple-50 border-purple-200 text-purple-700 font-medium">
            📅 Vence: {fdate(doc.dueDate)}
          </span>
        )}
        {legendMonto?.value && (
          <span className="text-xs rounded-full border px-3 py-1.5 bg-slate-50 font-medium" title={legendMonto.value}>
            💬 Monto en letras
          </span>
        )}
      </div>

      {/* Toggle items con mejor diseño */}
      <div className="border-t bg-secondary/20">
        <button
          onClick={async () => {
            const next = !open;
            setOpen(next);
            if (next && items.length === 0) await loadItems();
          }}
          className="flex w-full items-center justify-between px-5 py-3 text-sm hover:bg-muted/50 transition font-medium"
        >
          <span className="inline-flex items-center gap-2">
            <ListOrdered size={16} />
            {open ? "Ocultar ítems" : "Ver ítems del documento"}
          </span>
          {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {open && (
          <div className="p-5 pt-0">
            {loadingItems ? (
              <div className="text-sm text-muted-foreground py-4 text-center">Cargando ítems…</div>
            ) : items.length === 0 ? (
              <div className="text-sm text-muted-foreground py-4 text-center">Este documento no tiene ítems registrados.</div>
            ) : (
              <div className="overflow-x-auto rounded-lg border">
                <table className="min-w-full text-sm">
                  <thead className="bg-secondary/50 text-left">
                    <tr>
                      <th className="py-3 px-4 font-medium">#</th>
                      <th className="py-3 px-4 font-medium">Código</th>
                      <th className="py-3 px-4 font-medium">Descripción</th>
                      <th className="py-3 px-4 font-medium">Cant.</th>
                      <th className="py-3 px-4 font-medium">Unidad</th>
                      <th className="py-3 px-4 font-medium">P. Unit. (sin IGV)</th>
                      <th className="py-3 px-4 font-medium">P. Ref. (con IGV)</th>
                      <th className="py-3 px-4 font-medium">IGV</th>
                      <th className="py-3 px-4 font-medium">Importe</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((ln, i) => {
                      const cantidad = Number(ln.cantidad ?? 0);
                      const pUnit = Number(ln.precioUnitario ?? 0);
                      const importe = ln?.valorLinea != null && !isNaN(Number(ln.valorLinea))
                        ? Number(ln.valorLinea)
                        : Number((pUnit * cantidad) || 0);
                      return (
                        <tr key={ln?.id ?? i} className="border-t hover:bg-muted/30 transition-colors">
                          <td className="py-3 px-4">{ln.lineNumber ?? i + 1}</td>
                          <td className="py-3 px-4">{ln.codigo ?? "—"}</td>
                          <td className="py-3 px-4 max-w-xs">{ln.descripcion ?? "—"}</td>
                          <td className="py-3 px-4 text-right">{cantidad}</td>
                          <td className="py-3 px-4">{ln.unidad ?? "—"}</td>
                          <td className="py-3 px-4 text-right font-medium">{money(pUnit, moneda)}</td>
                          <td className="py-3 px-4 text-right">{ln.precioReferencial != null ? money(ln.precioReferencial, moneda) : "—"}</td>
                          <td className="py-3 px-4 text-right">{ln.igvPorcentaje != null ? `${ln.igvPorcentaje}%` : money(ln.igvMonto, moneda)}</td>
                          <td className="py-3 px-4 text-right font-bold">{money(importe, moneda)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer: archivo fuente con mejor diseño */}
      <div className="border-t bg-secondary/30 px-5 py-3 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="font-medium">Archivo:</span>
          <span className="truncate" title={doc?.storageName || "—"}>
            {doc?.storageName || "—"}
          </span>
        </div>
      </div>
    </div>
  );
}
