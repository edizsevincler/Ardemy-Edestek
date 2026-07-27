import { readFile, writeFile } from "fs/promises";
// @ts-expect-error - pdf-parse has no types
import pdfParse from "pdf-parse/lib/pdf-parse.js";

async function main() {
  const inputPath = process.argv[2];
  const outputPath = process.argv[3];
  const buffer = await readFile(inputPath);
  const data = await pdfParse(buffer);
  await writeFile(outputPath, data.text, "utf-8");
  console.log(`${data.numpages} sayfa, ${data.text.length} karakter yazıldı.`);
}

main();
