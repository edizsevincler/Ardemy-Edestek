import { prisma } from "@/lib/prisma";
import type { ExamLetter, ExamReviewItem } from "@/lib/exam-config";

type StoredAnswer = {
  questionId: string;
  selected: ExamLetter | null;
  correct: boolean;
};

// Bitmiş bir denemenin soru-soru dökümü (doğru cevap + açıklama dahil).
export async function buildExamReview(
  questionIds: string[],
  answers: StoredAnswer[]
): Promise<ExamReviewItem[]> {
  const questions = await prisma.examQuestion.findMany({
    where: { id: { in: questionIds } },
  });
  const byId = new Map(questions.map((q) => [q.id, q]));
  const selectedById = new Map(answers.map((a) => [a.questionId, a.selected]));

  return questionIds.flatMap((id) => {
    const q = byId.get(id);
    if (!q) return [];
    return [
      {
        id: q.id,
        topic: q.topic,
        prompt: q.prompt,
        optionA: q.optionA,
        optionB: q.optionB,
        optionC: q.optionC,
        optionD: q.optionD,
        selected: selectedById.get(id) ?? null,
        correct: q.correct,
        explanation: q.explanation,
      },
    ];
  });
}
