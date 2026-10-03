// Kullanım:
//   DATABASE_URL=... npx tsx scripts/backup-db.ts "<yedek-klasörü>" [--files]
//
// Veritabanındaki tüm tabloları JSON olarak dışa aktarır. --files verilirse
// ders dosyaları, soru PDF'leri, ödev ve cevap dosyaları da (Vercel Blob'dan)
// indirilir. DİKKAT: Yedek kişisel veri (e-posta, şifre özetleri, mesajlar)
// içerir; güvenli bir yerde saklayın, kimseyle paylaşmayın, GitHub'a koymayın.

import "dotenv/config";
import { mkdir, stat, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { Prisma, PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const outRoot = process.argv[2];
const withFiles = process.argv.includes("--files");
if (!outRoot) {
  console.error("Kullanım: backup-db.ts <yedek-klasörü> [--files]");
  process.exit(1);
}

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Geçici/ihtiyaç duyulmayan tablolar yedeğe girmez.
const SKIP = new Set(["LoginThrottle", "PasswordResetToken", "VerificationToken"]);

const FILE_MODELS: Record<string, string> = {
  LessonFile: "fileName",
  Question: "fileName",
  Assignment: "fileName",
  AssignmentSubmission: "fileName",
  QuestionAnswer: "fileName",
};

const safe = (name: string) => name.replace(/[^a-zA-Z0-9.\-_]/g, "_").slice(-80);

async function main() {
  const stamp = new Date().toISOString().slice(0, 10);
  const dir = join(outRoot, `ardemy-yedek-${stamp}`);
  await mkdir(dir, { recursive: true });

  const counts: Record<string, number> = {};
  const toDownload: { model: string; id: string; url: string; name: string }[] = [];

  for (const model of Object.values(Prisma.ModelName)) {
    if (SKIP.has(model)) continue;
    const key = model.charAt(0).toLowerCase() + model.slice(1);
    const delegate = (prisma as unknown as Record<string, { findMany: () => Promise<Record<string, unknown>[]> }>)[key];
    const rows = await delegate.findMany();
    counts[model] = rows.length;
    await writeFile(join(dir, `${model}.json`), JSON.stringify(rows, null, 1), "utf8");

    if (model in FILE_MODELS) {
      for (const row of rows) {
        const url = row.fileUrl;
        if (typeof url === "string" && url.startsWith("http")) {
          toDownload.push({
            model,
            id: String(row.id),
            url,
            name: String(row[FILE_MODELS[model]] ?? "dosya"),
          });
        }
      }
    }
  }

  let downloaded = 0;
  let failed = 0;
  let bytes = 0;
  if (withFiles) {
    for (const f of toDownload) {
      const target = join(dir, "dosyalar", f.model, `${f.id}-${safe(f.name)}`);
      try {
        await stat(target);
        continue; // zaten indirilmiş
      } catch {
        // indirilecek
      }
      try {
        const res = await fetch(f.url);
        if (!res.ok) throw new Error(String(res.status));
        const buf = Buffer.from(await res.arrayBuffer());
        await mkdir(join(dir, "dosyalar", f.model), { recursive: true });
        await writeFile(target, buf);
        downloaded++;
        bytes += buf.length;
      } catch {
        failed++;
      }
    }
  }

  await writeFile(
    join(dir, "OKU-BENI.txt"),
    [
      `ARDEMY VERİTABANI YEDEĞİ — ${stamp}`,
      "",
      "Her tablo ayrı bir .json dosyasıdır. Dosya yedeği alındıysa 'dosyalar' klasöründe.",
      "",
      "UYARI: Bu klasör kişisel veri (e-posta, şifre özetleri, mesajlar) içerir.",
      "Güvenli bir yerde saklayın, başkalarıyla paylaşmayın, GitHub'a yüklemeyin.",
      "",
      "Geri yükleme gerekirse bu klasörü Claude'a verin; tablolar sırayla yeniden yazılır.",
      "",
      "Satır sayıları:",
      ...Object.entries(counts).map(([m, n]) => `  ${m}: ${n}`),
      withFiles
        ? `\nDosyalar: ${toDownload.length} kayıt, ${downloaded} indirildi, ${failed} indirilemedi, ${(bytes / 1_048_576).toFixed(1)} MB.`
        : "\nDosyalar yedeğe dahil değil (--files ile alınır).",
    ].join("\n"),
    "utf8"
  );

  const totalRows = Object.values(counts).reduce((a, b) => a + b, 0);
  console.log(`Yedek hazır: ${dir}`);
  console.log(`${Object.keys(counts).length} tablo, ${totalRows} satır.`);
  if (withFiles) {
    console.log(`Dosyalar: ${toDownload.length} kayıt, ${downloaded} indirildi, ${failed} indirilemedi, ${(bytes / 1_048_576).toFixed(1)} MB.`);
  }
  await prisma.$disconnect();
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
