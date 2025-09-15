import { XMLParser } from "fast-xml-parser";
import { toRec } from '@/lib/utils';

// Configuración del parser para mantener atributos (p.ej. unitCode, currencyID)
// y unificar el texto/CDATA bajo la misma clave '#text' cuando coexistan con atributos
const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "",
  processEntities: false,
  ignoreDeclaration: true,
  trimValues: true,
  textNodeName: "#text",
  cdataPropName: "#text"
});

type Root = "Invoice" | "CreditNote" | "DebitNote";

/**
 * Detecta la raíz UBL (Invoice/CreditNote/DebitNote) tolerando prefijos de namespace
 * Ej.: { 'ubl:Invoice': { ... } } → 'Invoice'
 */
export function detectRoot(obj: unknown): Root {
  if (!obj || typeof obj !== "object") throw new Error("XML inválido o vacío");
  const o = toRec(obj) ?? {};
  const candidates: Array<{ key: string; val: unknown }> = Object.keys(o).map(k => ({ key: k, val: o[k] }));
  // Atajo rápido sin prefijo
  if (o["Invoice"]) return "Invoice";
  if (o["CreditNote"]) return "CreditNote";
  if (o["DebitNote"]) return "DebitNote";
  // Buscar con prefijos: ns:Invoice, ns:CreditNote, ns:DebitNote
  for (const { key } of candidates) {
    const base = key.includes(":") ? key.split(":").pop()! : key;
    if (base === "Invoice") return "Invoice";
    if (base === "CreditNote") return "CreditNote";
    if (base === "DebitNote") return "DebitNote";
  }
  throw new Error("Documento UBL no soportado (se esperaba Invoice, CreditNote o DebitNote)");
}

export function parseXmlText(text: string) {
  const cleanText = text.replace(/^\uFEFF/, ""); // BOM
  const xmlObj = parser.parse(cleanText) as unknown;
  const root = detectRoot(xmlObj);
  // El objeto puede tener prefijo: buscar la clave real
  const xmlRec = toRec(xmlObj) ?? {};
  let node: Record<string, unknown> | undefined = toRec(xmlRec[root]) as Record<string, unknown> | undefined;
  if (!node) {
    // localizar key con prefijo cuyo sufijo sea root
    for (const k of Object.keys(xmlRec)) {
      const base = k.includes(":") ? k.split(":").pop()! : k;
      if (base === root) { node = toRec(xmlRec[k]) as Record<string, unknown>; break; }
    }
  }
  if (!node) throw new Error(`No se encontró el nodo raíz '${root}' en el XML`);
  return { root, node, text: cleanText };
}

export async function parseXmlFile(file: File) {
  const text = await file.text();
  return parseXmlText(text);
}
