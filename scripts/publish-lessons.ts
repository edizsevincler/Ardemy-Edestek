// Kullanım: DATABASE_URL=... BLOB_READ_WRITE_TOKEN=... npx tsx scripts/publish-lessons.ts
//
// scratchpad/english-lessons içindeki PDF'leri Vercel Blob'a yükler ve her biri
// için bir TOPIC Question kaydı oluşturur. Aynı subject içinde sıralamanın
// (createdAt DESC) doğru görünmesi için ilk derse en yeni, son derse en eski
// zaman damgası verilir (Rusça derslerindeki yöntemle aynı).

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { put } from "@vercel/blob";
import { PDFDocument } from "pdf-lib";
import { readFile } from "fs/promises";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
export const prisma = new PrismaClient({ adapter });
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN;

if (!BLOB_TOKEN) {
  console.error("BLOB_READ_WRITE_TOKEN gerekli.");
  process.exit(1);
}

type LessonToPublish = {
  pdfPath: string; // scratchpad/english-lessons/xxx.pdf
  fileName: string; // orijinal görünen dosya adı
  title: string;
  subject: string;
  creditCost: number;
};

// Her ders, kendi "subject"ı içindeki en eski derse göre 1 saniye daha eski
// bir createdAt alır (liste sayfası createdAt DESC sıraladığı için ders 1
// en yeni, ders N en eski olmalı). Böylece scriptler farklı zamanlarda ayrı
// ayrı çalıştırılsa bile sıralama bozulmaz.
async function nextCreatedAt(subject: string): Promise<Date> {
  const oldest = await prisma.question.findFirst({
    where: { type: "TOPIC", subject },
    orderBy: { createdAt: "asc" },
    select: { createdAt: true },
  });
  if (!oldest) return new Date();
  return new Date(oldest.createdAt.getTime() - 1000);
}

export async function publishLessons(lessons: LessonToPublish[]) {
  for (const lesson of lessons) {
    const bytes = await readFile(lesson.pdfPath);
    const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
    const pageCount = doc.getPageCount();

    const blob = await put(`questions/${Date.now()}-${lesson.fileName}`, bytes, {
      access: "public",
      token: BLOB_TOKEN,
      contentType: "application/pdf",
    });

    const createdAt = await nextCreatedAt(lesson.subject);

    await prisma.question.create({
      data: {
        type: "TOPIC",
        title: lesson.title,
        subject: lesson.subject,
        fileUrl: blob.url,
        fileName: lesson.fileName,
        pageCount,
        creditCost: lesson.creditCost,
        isPublished: true,
        createdAt,
      },
    });

    console.log(`OK: ${lesson.title} -> ${pageCount} sayfa, ${blob.url}`);
  }
}

// Var olan bir dersin PDF'ini değiştirir (title+subject ile bulur), title/subject/
// creditCost/createdAt aynı kalır — sıralama ve fiyat bozulmaz.
export async function updateLessonPdf(lesson: LessonToPublish) {
  const existing = await prisma.question.findFirst({
    where: { type: "TOPIC", title: lesson.title, subject: lesson.subject },
  });
  if (!existing) {
    console.log(`ATLA (bulunamadı): "${lesson.title}" / "${lesson.subject}"`);
    return;
  }

  const bytes = await readFile(lesson.pdfPath);
  const doc = await PDFDocument.load(bytes, { ignoreEncryption: true });
  const pageCount = doc.getPageCount();

  const blob = await put(`questions/${Date.now()}-${lesson.fileName}`, bytes, {
    access: "public",
    token: BLOB_TOKEN,
    contentType: "application/pdf",
  });

  await prisma.question.update({
    where: { id: existing.id },
    data: { fileUrl: blob.url, fileName: lesson.fileName, pageCount },
  });

  console.log(`GÜNCELLENDİ: ${lesson.title} -> ${pageCount} sayfa`);
}
