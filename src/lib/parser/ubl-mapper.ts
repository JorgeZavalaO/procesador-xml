/* eslint-disable @typescript-eslint/no-explicit-any */
// UBL -> DTO mapper (limpio y robusto)
// Exporta: type MappedDoc y function mapUBLToDTO(root, rawNode, fileHash, storageName)

export type Root = "Invoice" | "CreditNote" | "DebitNote";

export type MappedLine = {
  id: string;
  documentId: string;
  lineNumber: number;
  descripcion: string;
  cantidad: number;
  unidad: string | null;
  codigo?: string;
  precioUnitario: number;          // SIN IGV
  precioReferencial?: number;      // CON IGV (cuando PriceTypeCode=01)
  valorLinea: number;              // SIN IGV
  igvMonto: number;
  igvPorcentaje?: number;
  igvAfectacionCodigo?: string | null;
};

export type MappedTax = {
  id: string;
  documentId: string;
  codigoImpuesto: string;          // 1000=IGV
  base: number;
  porcentaje?: number;
  monto: number;
  afectacion?: string | null;
};

export type MappedDoc = {
  document: {
    id: string;
    tipo: string;                   // 01/03/07/08
    serie: string;
    numero: string;
    moneda: string;
    issueDate: string;
    issueTime?: string;
    dueDate?: string;
    issuer: {
      id: string;
      ruc?: string;
      docType?: string;
      docNumber?: string;
      nombre?: string;
      direccion?: string;
    };
    customer: {
      id: string;
      ruc?: string;
      docType?: string;
      docNumber?: string;
      nombre?: string;
      direccion?: string;
    };
    subtotal: number;
    descuentos: number;
    totalIgv: number;
    taxInclusive?: number;
    total: number;
    payment?: {
      meansCode?: string;
      formaPago?: "Contado" | "Credito";
      detraction?: { code: string; percent: number; amount: number; account?: string };
    };
    legends?: Array<{ code: string; value: string }>;
    hash: string;
    storageName?: string;
  };
  lines: MappedLine[];
  taxes: MappedTax[];
};

/* ───────────────────────── helpers ───────────────────────── */

const asArray = <T>(x: T | T[] | undefined | null): T[] =>
  x == null ? [] : Array.isArray(x) ? x : [x];

const denamespace = (obj: any): any => {
  if (obj == null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(denamespace);
  const out: any = {};
  for (const k of Object.keys(obj)) {
    const nk = k.includes(":") ? k.split(":").pop() as string : k;
    out[nk] = denamespace((obj as any)[k]);
  }
  return out;
};

function textValue(x: any): string | undefined {
  if (x == null) return undefined;
  if (typeof x === "string" || typeof x === "number" || typeof x === "boolean") return String(x);
  if (typeof x === "object") {
    // Priorizar cualquier valor en "#text" (string|number|boolean)
    if ((x as any)["#text"] != null) return String((x as any)["#text"]);
    if ((x as any).value != null) return String((x as any).value);
    // último intento: toString sin [object Object]
    if (typeof (x as any).toString === "function") {
      const s = (x as any).toString();
      if (s && s !== "[object Object]") return s;
    }
  }
  return undefined;
}

function safeNumber(x: any, digits = 2): number {
  const raw = typeof x === "object" ? textValue(x) : x;
  const str = String(raw ?? "").replace(/,/g, ".").trim();
  const n = Number(str);
  return Number.isFinite(n) ? Number(n.toFixed(digits)) : 0;
}

function splitSerieNumero(id?: string) {
  if (!id) return { serie: "", numero: "" };
  const parts = id.split("-").map(s => s.trim());
  return { serie: parts[0] ?? "", numero: parts.slice(1).join("-") || parts[0] || "" };
}

function getPartyIdAndType(PartyIdentification?: any) {
  const pid = asArray(PartyIdentification)[0];
  if (!pid) return { docType: undefined, docNumber: undefined };
  const idVal = textValue(pid?.ID) ?? textValue(pid) ?? "";
  const docType = textValue(pid?.ID?.schemeID) ?? textValue(pid?.schemeID);
  return { docType, docNumber: idVal };
}

function readPostalAddress(addr?: any) {
  if (!addr) return undefined;
  const parts = [
    textValue(addr?.StreetName),
    textValue(addr?.CitySubdivisionName),
    textValue(addr?.CityName),
    textValue(addr?.District),
    textValue(addr?.CountrySubentity),
    textValue(addr?.Country?.IdentificationCode)
  ].filter(Boolean);
  return parts.join(", ");
}

function readLegends(note: any): Array<{ code: string; value: string }> {
  return asArray(note)
    .map((n: any) => ({
      code: textValue(n?.languageLocaleID) ?? "",
      value: (textValue(n?.["#text"]) ?? textValue(n)) ?? ""
    }))
    .filter(l => l.code && l.value);
}

function getPartyName(party?: any): string | undefined {
  if (!party) return undefined;
  // Rutas comunes en UBL para el nombre (algunas pueden ser arrays)
  const candidates = [
    party?.PartyLegalEntity?.RegistrationName,
    party?.PartyName?.Name,
    party?.RegistrationName,
    party?.Name,
    party?.PartyLegalEntity?.CorporateName,
  ];
  
  // Log de diagnóstico para debuggear nombres faltantes
  if (typeof console !== 'undefined') {
    console.group('🔍 DIAGNÓSTICO: getPartyName');
    console.log('🏢 Party objeto:', party ? JSON.stringify(party, null, 2) : 'undefined');
    console.log('📋 Candidatos evaluados:');
    candidates.forEach((candidate, i) => {
      // Si es array, tomar el primer elemento
      const actualCandidate = Array.isArray(candidate) ? candidate[0] : candidate;
      const value = textValue(actualCandidate);
      console.log(`  ${i + 1}. ${value ? `✅ "${value}"` : '❌ undefined/null'} (array: ${Array.isArray(candidate)})`);
    });
    console.groupEnd();
  }
  
  for (const c of candidates) {
    // Si es array, tomar el primer elemento
    const actualCandidate = Array.isArray(c) ? c[0] : c;
    const v = textValue(actualCandidate);
    if (v) return v;
  }
  return undefined;
}

/* ───────────────────────── mapper ───────────────────────── */

export function mapUBLToDTO(
  root: Root,
  rawNode: any,
  fileHash: string,
  storageName?: string
): MappedDoc {
  const node = denamespace(rawNode);

  // Tipo / ID / fechas / moneda
  const tipo =
    root === "Invoice" ? (textValue(node.InvoiceTypeCode) ?? "01")
    : root === "CreditNote" ? "07"
    : "08";

  const idStr = textValue(node.ID) ?? "";
  const { serie, numero } = splitSerieNumero(idStr);

  const moneda = (textValue(node.DocumentCurrencyCode) ?? "PEN").toUpperCase();
  const issueDate = textValue(node.IssueDate) ?? "";
  const issueTime = textValue(node.IssueTime) ?? undefined;
  const dueDate = textValue(node.DueDate) ?? undefined;
  const legends = readLegends(node.Note);

  // Emisor / Cliente
  const supParty = node.AccountingSupplierParty?.Party ?? node.SupplierParty?.Party;
  const cusParty = node.AccountingCustomerParty?.Party ?? node.CustomerParty?.Party;

  const supIds = getPartyIdAndType(supParty?.PartyIdentification);
  const cusIds = getPartyIdAndType(cusParty?.PartyIdentification);

  const supRuc = supIds.docType === "6" ? supIds.docNumber : undefined;
  const customerDocType =
    cusIds.docType ?? (cusIds.docNumber?.length === 11 ? "6" : cusIds.docNumber?.length === 8 ? "1" : undefined);

  const issuer = {
    id: crypto.randomUUID(),
    ruc: supRuc ?? supIds.docNumber,
    docType: supIds.docType,
    docNumber: supIds.docNumber,
      nombre: getPartyName(supParty) ?? textValue(supParty?.PartyLegalEntity?.RegistrationName) ?? textValue(supParty?.PartyName?.Name) ?? undefined,
    direccion: readPostalAddress(supParty?.PostalAddress),
  };

  const customer = {
    id: crypto.randomUUID(),
    ruc: customerDocType === "6" ? cusIds.docNumber : undefined,
    docType: customerDocType,
    docNumber: cusIds.docNumber,
      nombre: getPartyName(cusParty) ?? textValue(cusParty?.PartyLegalEntity?.RegistrationName) ?? textValue(cusParty?.PartyName?.Name) ?? undefined,
    direccion: readPostalAddress(cusParty?.PostalAddress),
  };

  // Payment (medio, forma, detracción)
  const means = node.PaymentMeans ?? {};
  const meansCode = textValue(means.PaymentMeansCode);
  const detractionAccount = textValue(means?.PayeeFinancialAccount?.ID);

  let formaPago: "Contado" | "Credito" | undefined;
  let detraction:
    | { code: string; percent: number; amount: number; account?: string }
    | undefined;

  for (const pt of asArray(node.PaymentTerms)) {
    const id = textValue(pt?.ID);
    if (id === "FormaPago") {
      const fp = textValue(pt?.PaymentMeansID);
      if (fp === "Contado" || fp === "Credito") formaPago = fp;
    }
    if (id === "Detraccion") {
      detraction = {
        code: textValue(pt?.PaymentMeansID) ?? "",
        percent: safeNumber(pt?.PaymentPercent),
        amount: safeNumber(pt?.Amount),
        account: detractionAccount
      };
    }
  }

  // Totales
  const legal = node.LegalMonetaryTotal ?? {};
  const subtotal = safeNumber(legal.LineExtensionAmount);
  const descuentos = safeNumber(legal.AllowanceTotalAmount);
  const taxInclusive = safeNumber(legal.TaxInclusiveAmount);
  const total = safeNumber(legal.PayableAmount);

  // Impuesto total
  const taxTotal = node.TaxTotal ?? {};
  const totalIgvDoc = safeNumber(taxTotal.TaxAmount);

  // Líneas
  const lineKey =
    root === "Invoice" ? "InvoiceLine" : root === "CreditNote" ? "CreditNoteLine" : "DebitNoteLine";
  const quantityKey =
    root === "Invoice" ? "InvoicedQuantity" : root === "CreditNote" ? "CreditedQuantity" : "DebitedQuantity";

  const rawLines = asArray(node[lineKey]);
  const documentId = crypto.randomUUID();

  const lines: MappedLine[] = rawLines.map((ln: any, idx: number) => {
    const qty = ln?.[quantityKey];
    const cantidad = safeNumber(qty, 6);
    const unidad =
      (qty && (qty.unitCode ?? qty?.["@_unitCode"])) ? String(qty.unitCode ?? qty?.["@_unitCode"])
      : (ln?.[quantityKey + "UnitCode"] ?? null);

    // Descripción y código
    const descArr = asArray(ln?.Item?.Description);
      const descripcion = String(
        descArr.map(textValue).find(Boolean) ??
        textValue(ln?.Item?.Name) ??
        textValue(ln?.Description) ??
        ""
      );

      const codigo = String(
        textValue(ln?.Item?.SellersItemIdentification?.ID) ??
        textValue(ln?.Item?.StandardItemIdentification?.ID) ??
        textValue(ln?.SellersItemIdentification?.ID) ??
        ""
      );

    // Impuestos por línea
    const taxSub = asArray(ln?.TaxTotal?.TaxSubtotal ?? ln?.TaxSubtotal);
    const igvSub = taxSub.find(
      (t: any) => (t?.TaxCategory?.TaxScheme?.ID ?? t?.TaxScheme?.ID) == "1000"
    );
    const igvMonto = safeNumber(igvSub?.TaxAmount);
    const igvPorcentaje =
      igvSub?.TaxCategory?.Percent != null
        ? safeNumber(igvSub?.TaxCategory?.Percent)
        : undefined;
    const afectacion = (textValue(igvSub?.TaxCategory?.TaxExemptionReasonCode) ?? null) as string | null;
    const baseGravable = safeNumber(igvSub?.TaxableAmount, 6);

    // Precios
    let precioUnitario = safeNumber(ln?.Price?.PriceAmount, 6); // SIN IGV
    let precioReferencial: number | undefined;                   // CON IGV

    const alt = asArray(ln?.PricingReference?.AlternativeConditionPrice);
    const alt01 = alt.find((a: any) => textValue(a?.PriceTypeCode) === "01");
    if (alt01) precioReferencial = safeNumber(alt01?.PriceAmount, 6);

    // Valor de línea
    let valorLinea = safeNumber(ln?.LineExtensionAmount, 6);
    if (!valorLinea && baseGravable) valorLinea = baseGravable;

    // Derivar faltantes
    if (!precioUnitario && precioReferencial != null && igvPorcentaje != null) {
      const div = 1 + igvPorcentaje / 100;
      if (div) precioUnitario = Number((precioReferencial / div).toFixed(6));
    }
    if (!valorLinea && cantidad && precioUnitario) {
      valorLinea = Number((precioUnitario * cantidad).toFixed(6));
    }
    if (!valorLinea && cantidad && precioReferencial != null && igvPorcentaje != null) {
      const div = 1 + igvPorcentaje / 100;
      valorLinea = Number(((precioReferencial / div) * cantidad).toFixed(6));
    }
    if (!precioUnitario && valorLinea && cantidad) {
      const p = valorLinea / cantidad;
      if (Number.isFinite(p)) precioUnitario = Number(p.toFixed(6));
    }

    return {
      id: crypto.randomUUID(),
      documentId,
        lineNumber: Number(textValue(ln?.ID) ?? idx + 1) || idx + 1,
      descripcion,
      cantidad: cantidad || 0,
      unidad: (unidad as string) || null,
      codigo: codigo || undefined,
      precioUnitario: precioUnitario || 0,
      precioReferencial,
      valorLinea: valorLinea || 0,
      igvMonto: igvMonto || 0,
      igvPorcentaje,
      igvAfectacionCodigo: afectacion,
    };
  });

  // Impuestos (resumen a nivel doc)
  const taxSubDoc = asArray(taxTotal.TaxSubtotal);
  const taxes: MappedTax[] = taxSubDoc.map((t: any) => ({
    id: crypto.randomUUID(),
    documentId,
    codigoImpuesto: String(t?.TaxCategory?.TaxScheme?.ID ?? t?.TaxScheme?.ID ?? ""),
    base: safeNumber(t?.TaxableAmount),
    porcentaje:
      t?.TaxCategory?.Percent != null ? safeNumber(t?.TaxCategory?.Percent) : undefined,
    monto: safeNumber(t?.TaxAmount),
    afectacion: (textValue(t?.TaxCategory?.TaxExemptionReasonCode) ?? null) as string | null,
  }));

  // Si el IGV total venía en 0 pero tenemos impuestos por línea/doc, súmalo
  const totalIgv =
    totalIgvDoc ||
    taxes.reduce((s, t) => s + (t.codigoImpuesto === "1000" ? t.monto : 0), 0);

  // Log de diagnóstico del documento procesado
  if (typeof console !== 'undefined') {
    console.group(`📄 DIAGNÓSTICO DOCUMENTO: ${root} ${serie}-${numero}`);
    console.log('📊 Información básica:', { tipo, serie, numero, moneda, issueDate, storageName });
    console.log('🏢 Emisor procesado:', {
      nombre: issuer.nombre,
      ruc: issuer.ruc,
      docType: issuer.docType,
      docNumber: issuer.docNumber,
      tieneNombre: !!issuer.nombre,
      tieneRuc: !!issuer.ruc
    });
    console.log('👤 Cliente procesado:', {
      nombre: customer.nombre,
      ruc: customer.ruc,
      docType: customer.docType,
      docNumber: customer.docNumber,
      tieneNombre: !!customer.nombre,
      tieneDoc: !!(customer.ruc || customer.docNumber)
    });
    console.log('💰 Totales:', { subtotal, descuentos, totalIgv, taxInclusive, total });
    console.log('📋 Resumen líneas:', { cantidadLineas: lines.length, primeraLinea: lines[0] || null });
    console.groupEnd();
  }

  const document: MappedDoc["document"] = {
    id: documentId,
    tipo,
    serie,
    numero,
    moneda,
    issueDate,
    issueTime,
    dueDate,
    issuer,
    customer,
    subtotal,
    descuentos,
    totalIgv,
    taxInclusive,
    total,
    payment: { meansCode, formaPago, detraction },
    legends,
    hash: fileHash,
    storageName,
  };

  return { document, lines, taxes };
}

export default mapUBLToDTO;
