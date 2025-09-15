import * as Comlink from "comlink";
import JSZip from "jszip";
import { parseXmlFile } from "@/lib/parser/ubl";
import { mapUBLToDTO } from "@/lib/parser/ubl-mapper";
import type { MappedDoc } from '@/lib/parser/ubl-mapper';
import { sha256 } from "@/lib/parser/normalizers";

const api = {
  async processFiles(files: File[]) {
    const results: MappedDoc[] = [];

    async function processOne(f: File, name?: string) {
      const hash = await sha256(f);
      const { root, node } = await parseXmlFile(f);
      const mapped = mapUBLToDTO(root, node, hash, name ?? f.name);
      results.push(mapped);
    }

    for (const f of files) {
      const isZip = f.name.toLowerCase().endsWith(".zip");
      if (!isZip) {
        await processOne(f);
      } else {
        const zip = await JSZip.loadAsync(await f.arrayBuffer());
        for (const entry of Object.values(zip.files)) {
          if (entry.dir) continue;
          if (!entry.name.toLowerCase().endsWith(".xml")) continue;
          const txt = await entry.async("text");
          const fileLike = new File([txt], entry.name, { type: "text/xml" });
          await processOne(fileLike, entry.name);
        }
      }
    }
    return results; // Array<MappedDoc>
  }
};

Comlink.expose(api);
