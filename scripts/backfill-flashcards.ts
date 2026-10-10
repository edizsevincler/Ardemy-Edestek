// Kullanım: DATABASE_URL=... npx tsx scripts/backfill-flashcards.ts
//
// Veritabanındaki tüm ders dosyalarından (docx) kelime kartlarını üretir.
// Tekrar çalıştırmak güvenlidir: aynı öğrenci + aynı kart zaten varsa atlanır.

import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { extractPairsFromDocx, pairKey, type CardPair } from "../src/lib/flashcards";

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });

async function main() {
  const files = await prisma.lessonFile.findMany({
    select: { studentId: true, title: true, fileUrl: true, fileName: true },
    orderBy: { uploadedAt: "asc" },
  });

  // Aynı dosya birden çok öğrenciye bağlı olabilir; her dosya bir kez indirilir.
  const cache = new Map<string, CardPair[]>();
  const urls = [...new Set(files.map((f) => f.fileUrl))].filter((u) => u.startsWith("http"));
  let failed = 0;
  const queue = [...urls];
  async function worker() {
    for (let url = queue.pop(); url; url = queue.pop()) {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(String(res.status));
        const name = files.find((f) => f.fileUrl === url)?.fileName ?? "";
        if (!/\.docx$/i.test(name)) {
          cache.set(url, []);
          continue;
        }
        cache.set(url, await extractPairsFromDocx(Buffer.from(await res.arrayBuffer())));
      } catch {
        failed++;
        cache.set(url, []);
      }
    }
  }
  await Promise.all(Array.from({ length: 8 }, worker));

  // Öğrenci bazında kartları birleştir (aynı kart farklı derslerde geçerse ilk dersin başlığı kalır).
  const perStudent = new Map<string, Map<string, { pair: CardPair; title: string }>>();
  for (const f of files) {
    const pairs = cache.get(f.fileUrl) ?? [];
    const bucket = perStudent.get(f.studentId) ?? new Map();
    for (const pair of pairs) {
      const key = pairKey(pair.front, pair.back);
      if (!bucket.has(key)) bucket.set(key, { pair, title: f.title });
    }
    perStudent.set(f.studentId, bucket);
  }

  let total = 0;
  for (const [studentId, bucket] of perStudent) {
    const rows = [...bucket.values()];
    const result = await prisma.flashCard.createMany({
      data: rows.map((r) => ({ userId: studentId, front: r.pair.front, back: r.pair.back, sourceTitle: r.title })),
      skipDuplicates: true,
    });
    total += result.count;
  }
  console.log(`Dosya: ${urls.length} (okunamayan: ${failed}) | öğrenci: ${perStudent.size} | eklenen kart: ${total}`);
  await prisma.$disconnect();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

