"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
import { dateKey, recordStreakActivity } from "@/lib/streak";
import { awardBadges } from "@/lib/badges";
import {
  getDailyLanguage,
  getTodaysQuizItem,
  type DailyOption,
} from "@/lib/daily-question";
import { revalidatePath } from "next/cache";

type AnswerResult =
  | { status: "error"; message: string }
  | {
      status: "success";
      correct: boolean;
      correctOption: DailyOption;
      newBadges: { emoji: string; title: string }[];
    };

export async function answerDailyQuestion(
  selected: DailyOption
): Promise<AnswerResult> {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== "GUEST" && session.user.role !== "STUDENT")
  ) {
    return { status: "error", message: "Oturum bulunamadı." };
  }
  if (!["A", "B", "C", "D"].includes(selected)) {
    return { status: "error", message: "Geçersiz seçenek." };
  }

  const userId = session.user.id;
  const todayKey = dateKey(new Date());

  const existing = await prisma.dailyQuestionAnswer.findUnique({
    where: { userId_dateKey: { userId, dateKey: todayKey } },
  });
  if (existing) {
    return { status: "error", message: "Bugünkü soruyu zaten cevapladın." };
  }

  const item = await getTodaysQuizItem(await getDailyLanguage(userId));
  if (!item) {
    return { status: "error", message: "Bugün için soru bulunamadı." };
  }
  const full = await prisma.quizItem.findUniqueOrThrow({
    where: { id: item.id },
    select: { correct: true },
  });
  const correct = full.correct === selected;

  try {
    await prisma.dailyQuestionAnswer.create({
      data: { userId, dateKey: todayKey, quizItemId: item.id, selected, correct },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { status: "error", message: "Bugünkü soruyu zaten cevapladın." };
    }
    throw error;
  }

  await recordStreakActivity(userId);
  const newBadges = await awardBadges(userId).catch(() => []);

  revalidatePath("/guest");
  revalidatePath("/student");

  return { status: "success", correct, correctOption: full.correct, newBadges };
}
