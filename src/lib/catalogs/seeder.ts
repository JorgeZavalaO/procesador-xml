import { getDB } from "@/lib/db/indexeddb";

const files = [
  { name: "catalogo_01_tipo_documento", path: "/catalogs/catalogo_01_tipo_documento.json" },
  { name: "catalogo_02_monedas", path: "/catalogs/catalogo_02_monedas.json" },
  { name: "catalogo_05_tributos", path: "/catalogs/catalogo_05_tributos.json" },
  { name: "catalogo_07_afectacion_igv", path: "/catalogs/catalogo_07_afectacion_igv.json" },
  { name: "catalogo_UM_uncefact", path: "/catalogs/catalogo_UM_uncefact.json" }
];

export async function seedCatalogsOnce() {
  const db = await getDB();
  
  // Fetch all data first
  const dataToSeed = [];
  for (const f of files) {
    const res = await fetch(f.path, { cache: "no-store" });
    const data = await res.json();
    dataToSeed.push({ name: f.name, items: data });
  }
  
  // Then put in transaction
  const tx = db.transaction("catalogs", "readwrite");
  for (const item of dataToSeed) {
    await tx.store.put(item);
  }
  await tx.done;
}
