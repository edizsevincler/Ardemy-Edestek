// Kullanım:
// LOCAL_DATABASE_URL=... PROD_DATABASE_URL=... BLOB_READ_WRITE_TOKEN=... npx tsx scripts/migrate-to-production.ts
//
// Yereldeki gerçek verileri (öğrenciler, ödevler, ders dosyaları, mesajlar,
// kredi paketleri) prod veritabanına kopyalar; dosyaları Vercel Blob'a
// yeniden yükler. Test amaçlı GUEST hesapları ve sorular kasıtlı olarak
// atlanır. Tekrar çalıştırmak güvenlidir (upsert kullanır).

import "dotenv/config";
import { readFile } from "fs/promises";
import path from "path";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { put } from "@vercel/blob";

const LOCAL_URL = process.env.LOCAL_DATABASE_URL;
const PROD_URL = process.env.PROD_DATABASE_URL;
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

if (!LOCAL_URL || !PROD_URL || !BLOB_TOKEN) {
  console.error(
    "LOCAL_DATABASE_URL, PROD_DATABASE_URL ve BLOB_READ_WRITE_TOKEN gerekli."
  );
  process.exit(1);
}

const localDb = new PrismaClient({
  adapter: new PrismaPg({ connectionString: LOCAL_URL }),
});
const prodDb = new PrismaClient({
  adapter: new PrismaPg({ connectionString: PROD_URL }),
});

const UPLOAD_ROOT = path.join(process.cwd(), "uploads");

async function migrateFile(
  fileUrl: string | null,
  subdir: string
): Promise<string | null> {
  if (!fileUrl || fileUrl.startsWith("http")) return fileUrl;
  const buffer = await readFile(path.join(UPLOAD_ROOT, fileUrl));
  const fileName = fileUrl.split("/").pop()!;
  const blob = await put(`${subdir}/${fileName}`, buffer, {
    access: "public",
    token: BLOB_TOKEN,
  });
  return blob.url;
}

async function main() {
  const students = await localDb.user.findMany({ where: { role: "STUDENT" } });
  for (const u of students) {
    await prodDb.user.upsert({ where: { id: u.id }, update: {}, create: u });
  }
  console.log(`✓ ${students.length} öğrenci taşındı`);

  const assignments = await localDb.assignment.findMany();
  for (const a of assignments) {
    const fileUrl = await migrateFile(a.fileUrl, "assignments");
    await prodDb.assignment.upsert({
      where: { id: a.id },
      update: {},
      create: { ...a, fileUrl },
    });
  }
  console.log(`✓ ${assignments.length} ödev taşındı`);

  const submissions = await localDb.assignmentSubmission.findMany();
  for (const s of submissions) {
    const fileUrl = await migrateFile(s.fileUrl, "submissions");
    await prodDb.assignmentSubmission.upsert({
      where: { id: s.id },
      update: {},
      create: { ...s, fileUrl: fileUrl! },
    });
  }
  console.log(`✓ ${submissions.length} ödev teslimi taşındı`);

  const lessonFiles = await localDb.lessonFile.findMany();
  let i = 0;
  for (const f of lessonFiles) {
    const fileUrl = await migrateFile(f.fileUrl, "lesson-files");
    await prodDb.lessonFile.upsert({
      where: { id: f.id },
      update: {},
      create: { ...f, fileUrl: fileUrl! },
    });
    i++;
    if (i % 50 === 0) console.log(`  ... ${i}/${lessonFiles.length}`);
  }
  console.log(`✓ ${lessonFiles.length} ders dosyası taşındı`);

  const messages = await localDb.message.findMany();
  for (const m of messages) {
    await prodDb.message.upsert({ where: { id: m.id }, update: {}, create: m });
  }
  console.log(`✓ ${messages.length} mesaj taşındı`);

  const packages = await localDb.creditPackage.findMany();
  for (const p of packages) {
    await prodDb.creditPackage.upsert({
      where: { id: p.id },
      update: {},
      create: p,
    });
  }
  console.log(`✓ ${packages.length} kredi paketi taşındı`);

  console.log("\nTamamlandı.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await localDb.$disconnect();
    await prodDb.$disconnect();
  });
