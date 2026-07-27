import { writeFile, mkdir } from "fs/promises";
import path from "path";
// @ts-expect-error - pdf-parse has no types
import pdfParse from "pdf-parse/lib/pdf-parse.js";

const SCRATCH =
  "C:\\Users\\KEMAL_~1\\AppData\\Local\\Temp\\claude\\C--Users-Kemal-Tahir-Desktop-ARDEMY-PROJEM\\03f01dab-e2c1-4393-8cc5-fcca62c1b41a\\scratchpad";

type Manifest = { id: string; title: string; subject: string; fileUrl: string }[];

async function main() {
  const manifest: Manifest = JSON.parse(
    await (await import("fs/promises")).readFile(
      path.join(SCRATCH, "manifest.json"),
      "utf-8"
    )
  );

  const outDir = path.join(SCRATCH, "txt");
  await mkdir(outDir, { recursive: true });

  for (const item of manifest) {
    const outPath = path.join(outDir, `${item.id}.txt`);
    try {
      const res = await fetch(item.fileUrl);
      if (!res.ok) {
        console.log(`HATA indirme (${res.status}): ${item.title}`);
        continue;
      }
      const buffer = Buffer.from(await res.arrayBuffer());
      const data = await pdfParse(buffer);
      await writeFile(outPath, data.text, "utf-8");
      console.log(`OK ${item.subject} / ${item.title} -> ${data.numpages}s, ${data.text.length} karakter`);
    } catch (err) {
      console.log(`HATA: ${item.title}`, err);
    }
  }
}

main();
