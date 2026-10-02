import { prisma } from "@/lib/prisma";
import { dateKey } from "@/lib/streak";

export type DailyOption = "A" | "B" | "C" | "D";

export type DailyItem = {
  id: string;
  prompt: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  subject: string;
  title: string;
};

export type DailyResult = {
  selected: DailyOption;
  correct: boolean;
  correctOption: DailyOption;
};

const itemSelect = {
  id: true,
  prompt: true,
  optionA: true,
  optionB: true,
  optionC: true,
  optionD: true,
  question: { select: { title: true, subject: true } },
} as const;

function hashString(value: string) {
  let hash = 0;
  for (const char of value) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return hash;
}

const publishedQuizItems = {
  question: { isPublished: true, type: "QUIZ" as const },
};

function toDailyItem(item: {
  id: string;
  prompt: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  question: { title: string; subject: string };
}): DailyItem {
  return {
    id: item.id,
    prompt: item.prompt,
    optionA: item.optionA,
    optionB: item.optionB,
    optionC: item.optionC,
    optionD: item.optionD,
    subject: item.question.subject,
    title: item.question.title,
  };
}

// Bugünün sorusu tarihten türetilir (herkese aynı soru, gün değişince değişir).
// Doğru cevap (correct) bilerek seçilmiyor — istemciye hiç gitmemeli.
export async function getTodaysQuizItem(): Promise<DailyItem | null> {
  const count = await prisma.quizItem.count({ where: publishedQuizItems });
  if (count === 0) return null;

  const index = hashString(dateKey(new Date())) % count;
  const item = await prisma.quizItem.findFirst({
    where: publishedQuizItems,
    orderBy: { id: "asc" },
    skip: index,
    select: itemSelect,
  });
  return item ? toDailyItem(item) : null;
}

export async function getDailyState(
  userId: string
): Promise<{ item: DailyItem; result: DailyResult | null } | null> {
  const answer = await prisma.dailyQuestionAnswer.findUnique({
    where: { userId_dateKey: { userId, dateKey: dateKey(new Date()) } },
  });

  if (answer) {
    const answered = await prisma.quizItem.findUnique({
      where: { id: answer.quizItemId },
      select: { ...itemSelect, correct: true },
    });
    if (answered) {
      return {
        item: toDailyItem(answered),
        result: {
          selected: answer.selected,
          correct: answer.correct,
          correctOption: answered.correct,
        },
      };
    }
  }

  const item = await getTodaysQuizItem();
  return item ? { item, result: null } : null;
}
