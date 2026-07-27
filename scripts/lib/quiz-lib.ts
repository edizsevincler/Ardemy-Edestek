import { PrismaClient } from "../../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
export const prisma = new PrismaClient({ adapter });

export type QuizQuestionDef = {
  prompt: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correct: "A" | "B" | "C" | "D";
};

export type QuizDef = {
  title: string; // ör: "1 Geniş Zaman (Present Simple) - Test"
  subject: string; // ör: "İngilizce - Zamanlar"
  creditCost: number;
  questions: QuizQuestionDef[]; // tam 20 soru
};

// Aynı subject içindeki en eski QUIZ'e göre 1 saniye daha eski createdAt verir
// (TOPIC listesindeki nextCreatedAt ile aynı mantık, ama type=QUIZ için ayrı).
async function nextQuizCreatedAt(subject: string): Promise<Date> {
  const oldest = await prisma.question.findFirst({
    where: { type: "QUIZ", subject },
    orderBy: { createdAt: "asc" },
    select: { createdAt: true },
  });
  if (!oldest) return new Date();
  return new Date(oldest.createdAt.getTime() - 1000);
}

export async function publishQuiz(quiz: QuizDef) {
  if (quiz.questions.length !== 20) {
    throw new Error(`"${quiz.title}" tam 20 soru içermiyor (${quiz.questions.length}).`);
  }

  const existing = await prisma.question.findFirst({
    where: { type: "QUIZ", title: quiz.title, subject: quiz.subject },
  });
  if (existing) {
    console.log(`ATLA (zaten var): ${quiz.title}`);
    return;
  }

  const createdAt = await nextQuizCreatedAt(quiz.subject);

  await prisma.question.create({
    data: {
      type: "QUIZ",
      title: quiz.title,
      subject: quiz.subject,
      creditCost: quiz.creditCost,
      isPublished: true,
      createdAt,
      quizItems: {
        create: quiz.questions.map((q, i) => ({
          order: i + 1,
          prompt: q.prompt,
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          optionD: q.optionD,
          correct: q.correct,
        })),
      },
    },
  });

  console.log(`OK: ${quiz.title} -> 20 soru eklendi`);
}
