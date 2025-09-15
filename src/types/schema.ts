import { z } from "zod";

export const PartySchema = z.object({
  id: z.string(),
  ruc: z.string().optional(),
  docType: z.string().optional(),
  docNumber: z.string().optional(),
  nombre: z.string().optional(),
  direccion: z.string().optional()
});

/* ---------- NUEVO: pagos/detracción y leyendas ---------- */
export const PaymentSchema = z.object({
  meansCode: z.string().optional(),                  // p.e. "001"
  formaPago: z.enum(["Contado","Credito"]).optional(),
  detraction: z.object({
    code: z.string(),                                // "022"
    percent: z.number(),                             // 12.00
    amount: z.number(),                              // 3776
    account: z.string().optional()                   // "1910..."
  }).optional()
});

export const LegendSchema = z.object({
  code: z.string(),                                  // 1000, 2006, etc.
  value: z.string()
});
/* -------------------------------------------------------- */

export const DocumentSchema = z.object({
  id: z.string(),
  tipo: z.string(),                 // 01/03/07/08
  serie: z.string(),
  numero: z.string(),
  moneda: z.string(),
  issueDate: z.string(),            // ISO
  issueTime: z.string().optional(), // NUEVO
  dueDate: z.string().optional(),   // NUEVO
  issuer: PartySchema,
  customer: PartySchema,
  subtotal: z.number(),
  descuentos: z.number().default(0),
  totalIgv: z.number(),
  taxInclusive: z.number().optional(), // NUEVO (importe con IGV)
  total: z.number(),
  hash: z.string(),
  storageName: z.string().optional(),
  payment: PaymentSchema.optional(),  // NUEVO
  legends: z.array(LegendSchema).default([]) // NUEVO
});
export type DocumentDTO = z.infer<typeof DocumentSchema>;

export const LineSchema = z.object({
  id: z.string(),
  documentId: z.string(),
  lineNumber: z.number(),
  descripcion: z.string(),
  cantidad: z.number(),
  unidad: z.string().nullable(),
  codigo: z.string().optional(),             // NUEVO
  precioUnitario: z.number(),
  precioReferencial: z.number().optional(),  // NUEVO (con IGV si aplica)
  valorLinea: z.number(),
  igvMonto: z.number(),
  igvPorcentaje: z.number().optional(),      // NUEVO (18%)
  igvAfectacionCodigo: z.string().nullable()
});

export const TaxSchema = z.object({
  id: z.string(),
  documentId: z.string(),
  codigoImpuesto: z.string(),
  base: z.number(),
  porcentaje: z.number().optional(),
  monto: z.number(),
  afectacion: z.string().nullable()
});
