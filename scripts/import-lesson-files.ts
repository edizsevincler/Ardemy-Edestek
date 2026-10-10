// Kullanım: npx tsx scripts/import-lesson-files.ts "<klasör-yolu>"
//
// Beklenen yapı: <klasör-yolu>/<Öğrenci Adı Soyadı>/<tarih> ... .docx
// Klasör adı, veritabanındaki öğrenci adıyla birebir eşleşmeli.
// Dosya adındaki tarih iki biçimde olabilir: "13.06.2025 ..." veya
// "10 Temmuz 2024 ...". Tekrar çalıştırmak güvenlidir: aynı öğrenci + aynı
// başlığa sahip dosya zaten varsa tekrar yüklenmez.

import "dotenv/config";
import { readdir, stat, readFile } from "fs/promises";
import path from "path";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { saveUploadedFile } from "../src/lib/storage";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const sourceDir = process.argv[2];

const MONTHS: Record<string, number> = {
  ocak: 0,
  şubat: 1,
  mart: 2,
  nisan: 3,
  mayıs: 4,
  haziran: 5,
  temmuz: 6,
  ağustos: 7,
  eylül: 8,
  ekim: 9,
  kasım: 10,
  aralık: 11,
};

// Dosya adlarında "gün.ay.yıl" yerine yanlışlıkla "ay.gün.yıl" (ABD biçimi)
// yazılmış birkaç dosya var (örn. "10.31.2025"). 12'den büyük olan taraf
// her zaman gün olmak zorunda, bu yüzden hangisinin gün hangisinin ay
// olduğunu buna göre tespit ediyoruz.
function resolveDayMonth(a: number, b: number) {
  if (a > 12 && b <= 12) return { day: a, month: b };
  if (b > 12 && a <= 12) return { day: b, month: a };
  return { day: a, month: b };
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function cleanNote(text: string, studentName: string) {
  return text.replace(studentName, "").replace(/\s+/g, " ").trim();
}

// Tarih, dosya adının her zaman başında değil — bazen isim önce, tarih
// sonra yazılmış (örn. "Çağatay Bey 24.07.2024.docx"). Bu yüzden tarihi
// dizginin herhangi bir yerinde arıyoruz, başında olmasını şart koşmuyoruz.
function parseFileName(fileName: string, studentName: string) {
  const base = fileName.replace(/\.docx$/i, "").trim();

  const numeric = base.match(/(\d{1,2})\.(\d{1,2})\.(\d{4})/);
  if (numeric) {
    const [full, aStr, bStr, yStr] = numeric;
    const { day, month } = resolveDayMonth(Number(aStr), Number(bStr));
    const lessonDate = new Date(Number(yStr), month - 1, day);
    const note = cleanNote(base.replace(full, ""), studentName);
    const dateLabel = `${pad(day)}.${pad(month)}.${yStr}`;
    return { lessonDate, title: note ? `${dateLabel} ${note}` : dateLabel };
  }

  const monthNamePattern = new RegExp(
    `(\\d{1,2})\\s+(${Object.keys(MONTHS).join("|")})(?:\\s+(\\d{4}))?`,
    "i"
  );
  const named = base.match(monthNamePattern);
  if (named) {
    const [full, dStr, monthName, yStrInline] = named;
    const month = MONTHS[monthName.toLowerCase()];
    const day = Number(dStr);
    const noteWithoutMatch = cleanNote(base.replace(full, ""), studentName);

    const yStr = yStrInline ?? noteWithoutMatch.match(/\b(19|20)\d{2}\b/)?.[0];
    if (yStr) {
      const note = cleanNote(noteWithoutMatch.replace(yStr, ""), studentName);
      const lessonDate = new Date(Number(yStr), month, day);
      const dateLabel = `${pad(day)}.${pad(month + 1)}.${yStr}`;
      return { lessonDate, title: note ? `${dateLabel} ${note}` : dateLabel };
    }

    // Yılı belirtilmemiş — tarihi güvenilir şekilde kuramayız, başlığı
    // olduğu gibi bırakıyoruz (admin panelinden elle düzeltilebilir).
    return { lessonDate: null, title: cleanNote(base, studentName) || base };
  }

  return null;
}

async function main() {
  if (!sourceDir) {
    console.error(
      'Kullanım: npx tsx scripts/import-lesson-files.ts "<klasör-yolu>"'
    );
    process.exit(1);
  }

  const students = await prisma.user.findMany({ where: { role: "STUDENT" } });
  const studentByName = new Map(students.map((s) => [s.name, s]));

  const entries = await readdir(sourceDir, { withFileTypes: true });
  const folders = entries.filter((e) => e.isDirectory());

  const report: string[] = [];
  const undated: string[] = [];

  for (const folder of folders) {
    const studentName = folder.name;
    const student = studentByName.get(studentName);
    if (!student) {
      report.push(`⚠ Eşleşen öğrenci yok: "${studentName}"`);
      continue;
    }

    const dir = path.join(sourceDir, folder.name);
    const files = (await readdir(dir)).filter((f) =>
      f.toLowerCase().endsWith(".docx")
    );

    let imported = 0;
    let skipped = 0;
    let emptyFiles = 0;

    for (const fileName of files) {
      const filePath = path.join(dir, fileName);
      const stats = await stat(filePath);
      if (stats.size === 0) {
        emptyFiles++;
        continue;
      }

      const parsed = parseFileName(fileName, studentName);
      const title = parsed ? parsed.title : fileName.replace(/\.docx$/i, "");
      const lessonDate = parsed ? parsed.lessonDate : null;
      if (!lessonDate) {
        undated.push(`${studentName}: ${fileName}`);
      }

      const existing = await prisma.lessonFile.findFirst({
        where: { studentId: student.id, title },
      });
      if (existing) {
        skipped++;
        continue;
      }

      const buffer = await readFile(filePath);
      const file = new File([buffer], fileName, {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      });
      const saved = await saveUploadedFile(file, "lesson-files");

      await prisma.lessonFile.create({
        data: {
          title,
          studentId: student.id,
          fileUrl: saved.fileUrl,
          fileName: saved.fileName,
          lessonDate,
        },
      });
      imported++;
    }

    if (files.length === 0) {
      report.push(`— ${studentName}: klasör boş`);
    } else {
      report.push(
        `✓ ${studentName}: ${imported} yeni, ${skipped} zaten vardı, ${emptyFiles} boş/bozuk dosya atlandı`
      );
    }
  }

  const folderNames = new Set(folders.map((f) => f.name));
  const noFolder = students.filter((s) => !folderNames.has(s.name));
  if (noFolder.length > 0) {
    report.push("");
    report.push("Klasörü hiç olmayan öğrenciler:");
    for (const s of noFolder) report.push(`  - ${s.name}`);
  }

  if (undated.length > 0) {
    report.push("");
    report.push(
      `Tarihi belirlenemeyen (yılı yazılmamış) ${undated.length} dosya — başlık olarak yüklendi, admin panelinden tarih eklenebilir:`
    );
    for (const u of undated) report.push(`  - ${u}`);
  }

  console.log(report.join("\n"));
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
