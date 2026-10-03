// Kullanım: DATABASE_URL=... npx tsx scripts/seed-exam-questions.ts
//
// Deneme sınavı havuzunu (ExamQuestion) doldurur. Sorular soru bankasındaki
// testlerden (QuizItem) bağımsızdır; yine de aynı metne sahip olan bir soru
// varsa atlanır. Tekrar çalıştırmak güvenlidir (language + prompt benzersiz).

import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { buildExamQuestions } from "./lib/exam-lib";
import { EXAM_EN } from "./data/exam-en";
import { EXAM_RU } from "./data/exam-ru";
import { EXAM_EN_2 } from "./data/exam-en-2";
import { EXAM_RU_2 } from "./data/exam-ru-2";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const norm = (s: string) => s.toLowerCase().replace(/\s+/g, " ").trim();

async function main() {
  const existing = await prisma.quizItem.findMany({ select: { prompt: true } });
  const bank = new Set(existing.map((q) => norm(q.prompt)));

  const sets = [
    { language: "İngilizce", rows: buildExamQuestions("İngilizce", [...EXAM_EN, ...EXAM_EN_2]) },
    { language: "Rusça", rows: buildExamQuestions("Rusça", [...EXAM_RU, ...EXAM_RU_2]) },
  ];

  for (const { language, rows } of sets) {
    const fresh = rows.filter((r) => !bank.has(norm(r.prompt)));
    const skipped = rows.length - fresh.length;
    const result = await prisma.examQuestion.createMany({
      data: fresh,
      skipDuplicates: true,
    });
    const total = await prisma.examQuestion.count({ where: { language } });
    const dist = { A: 0, B: 0, C: 0, D: 0 };
    for (const r of fresh) dist[r.correct]++;
    console.log(
      `${language}: ${rows.length} hazır, ${skipped} soru bankasıyla çakıştığı için atlandı, ${result.count} eklendi, havuzda toplam ${total}. Doğru şık dağılımı:`,
      dist
    );
  }
  await prisma.$disconnect();
}

main();
