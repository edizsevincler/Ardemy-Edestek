import { writeFile, mkdir, readFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const UPLOAD_ROOT = path.join(process.cwd(), "uploads");

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, "_").slice(-100);
}

export async function saveUploadedFile(file: File, subdir: string) {
  const dir = path.join(UPLOAD_ROOT, subdir);
  await mkdir(dir, { recursive: true });

  const storedName = `${randomUUID()}-${sanitizeFileName(file.name)}`;
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, storedName), bytes);

  return { fileUrl: `${subdir}/${storedName}`, fileName: file.name };
}

export async function readStoredFile(fileUrl: string) {
  return readFile(path.join(UPLOAD_ROOT, fileUrl));
}
