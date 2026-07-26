import { writeFile, mkdir, readFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { put } from "@vercel/blob";
import { PDFDocument } from "pdf-lib";

const UPLOAD_ROOT = path.join(process.cwd(), "uploads");

// Vercel'in sunucuları kalıcı disk sağlamıyor, bu yüzden yayında dosyalar
// Vercel Blob'a yüklenir. Yerelde (BLOB_READ_WRITE_TOKEN yokken) eskisi gibi
// `uploads/` klasörüne yazılmaya devam eder — iki ortam da aynı kodla çalışır.
// Önemli: blob URL'leri asla doğrudan tarayıcıya verilmez, sadece bizim
// yetki kontrolü yapan API route'larımız bu URL'den dosyayı çekip iletir.
const USE_BLOB = !!process.env.BLOB_READ_WRITE_TOKEN;

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, "_").slice(-100);
}

export async function saveUploadedFile(file: File, subdir: string) {
  const storedName = `${randomUUID()}-${sanitizeFileName(file.name)}`;

  if (USE_BLOB) {
    const blob = await put(`${subdir}/${storedName}`, file, {
      access: "public",
    });
    return { fileUrl: blob.url, fileName: file.name };
  }

  const dir = path.join(UPLOAD_ROOT, subdir);
  await mkdir(dir, { recursive: true });
  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, storedName), bytes);

  return { fileUrl: `${subdir}/${storedName}`, fileName: file.name };
}

export async function getPdfPageCount(file: File): Promise<number | null> {
  if (!file.name.toLowerCase().endsWith(".pdf")) return null;
  try {
    const bytes = await file.arrayBuffer();
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    return doc.getPageCount();
  } catch {
    return null;
  }
}

export async function readStoredFile(fileUrl: string) {
  if (fileUrl.startsWith("http")) {
    const res = await fetch(fileUrl);
    if (!res.ok) {
      throw new Error(`Dosya alınamadı: ${res.status}`);
    }
    return Buffer.from(await res.arrayBuffer());
  }

  return readFile(path.join(UPLOAD_ROOT, fileUrl));
}
