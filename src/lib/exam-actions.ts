"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { recordStreakActivity, streakNotes } from "@/lib/streak";
import { awardBadges } from "@/lib/badges";
import { buildExamReview } from "@/lib/exam";
import {
  EXAM_LANGUAGES,
  EXAM_PRICE_CREDITS,
  EXAM_RESUME_HOURS,
  EXAM_SIZE,
  type ExamLetter,
  type ExamResultData,
} from "@/lib/exam-config";
import { revalidatePath } from "next/cache";
import { getT } from "@/lib/i18n/server";

type StartResult =
  | { status: "success"; attemptId: string }
  | { status: "error"; message: string };

type SubmitResult =
  | { status: "error"; message: string }
  | {
      status: "success";
      result: ExamResultData;
      newBadges: { emoji: string; title: string }[];
      streakNotes: string[];
    };

async function requireUserId() {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== "GUEST" && session.user.role !== "STUDENT")
  ) {
    return null;
  }
  return session.user.id;
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function refreshLayouts() {
  revalidatePath("/guest", "layout");
  revalidatePath("/student", "layout");
}

export async function startExam(language: string): Promise<StartResult> {
  const t = await getT();
  const userId = await requireUserId();
  if (!userId) return { status: "error", message: t("Oturum bulunamadı.") };
  if (!(EXAM_LANGUAGES as readonly string[]).includes(language)) {
    return { status: "error", message: t("Geçersiz dil.") };
  }

  // Yarım kalmış bir sınav varsa yeniden ücret alınmadan oradan devam edilir.
  const resumeAfter = new Date(Date.now() - EXAM_RESUME_HOURS * 3_600_000);
  const open = await prisma.examAttempt.findFirst({
    where: { userId, submittedAt: null, startedAt: { gt: resumeAfter } },
    orderBy: { startedAt: "desc" },
  });
  if (open) return { status: "success", attemptId: open.id };

  const pool = await prisma.examQuestion.findMany({
    where: { language },
    select: { id: true },
  });
  if (pool.length < EXAM_SIZE) {
    return {
      status: "error",
      message: t("Bu dilde yeterli deneme sorusu henüz yok."),
    };
  }

  // Daha önce çözülmemiş sorular öncelikli seçilir; yetmezse tekrar karışır.
  const past = await prisma.examAttempt.findMany({
    where: { userId, language },
    select: { questionIds: true },
  });
  const seen = new Set(past.flatMap((a) => a.questionIds as string[]));
  const unseen = pool.filter((q) => !seen.has(q.id));
  const picked = [
    ...shuffle(unseen).slice(0, EXAM_SIZE),
    ...shuffle(pool.filter((q) => seen.has(q.id))),
  ]
    .slice(0, EXAM_SIZE)
    .map((q) => q.id);
  const questionIds = shuffle(picked);

  try {
    const attempt = await prisma.$transaction(async (tx) => {
      const paid = await tx.user.updateMany({
        where: { id: userId, credits: { gte: EXAM_PRICE_CREDITS } },
        data: { credits: { decrement: EXAM_PRICE_CREDITS } },
      });
      if (paid.count === 0) throw new Error("NO_CREDITS");
      return tx.examAttempt.create({
        data: { userId, language, questionIds, total: questionIds.length },
      });
    });
    refreshLayouts();
    return { status: "success", attemptId: attempt.id };
  } catch (error) {
    if (error instanceof Error && error.message === "NO_CREDITS") {
      return {
        status: "error",
        message: t("Deneme sınavı için {n} kredi gerekli.", { n: EXAM_PRICE_CREDITS }),
      };
    }
    throw error;
  }
}

export async function submitExam(
  attemptId: string,
  answers: Record<string, ExamLetter>
): Promise<SubmitResult> {
  const t = await getT();
  const userId = await requireUserId();
  if (!userId) return { status: "error", message: t("Oturum bulunamadı.") };

  const attempt = await prisma.examAttempt.findUnique({
    where: { id: attemptId },
  });
  if (!attempt || attempt.userId !== userId) {
    return { status: "error", message: t("Sınav bulunamadı.") };
  }
  if (attempt.submittedAt) {
    return { status: "error", message: t("Bu sınav zaten tamamlandı.") };
  }

  const questionIds = attempt.questionIds as string[];
  const questions = await prisma.examQuestion.findMany({
    where: { id: { in: questionIds } },
    select: { id: true, correct: true },
  });
  const correctById = new Map(questions.map((q) => [q.id, q.correct]));

  const graded = questionIds.map((id) => {
    const raw = answers[id];
    const selected: ExamLetter | null = ["A", "B", "C", "D"].includes(raw)
      ? raw
      : null;
    return {
      questionId: id,
      selected,
      correct: selected !== null && selected === correctById.get(id),
    };
  });
  const score = graded.filter((g) => g.correct).length;

  // Çift gönderimi engelle: yalnızca hâlâ açık olan kayıt güncellenir.
  const updated = await prisma.examAttempt.updateMany({
    where: { id: attemptId, submittedAt: null },
    data: { submittedAt: new Date(), score, answers: graded },
  });
  if (updated.count === 0) {
    return { status: "error", message: t("Bu sınav zaten tamamlandı.") };
  }

  const activity = await recordStreakActivity(userId);
  const newBadges = await awardBadges(userId).catch(() => []);
  const review = await buildExamReview(questionIds, graded);

  refreshLayouts();

  return {
    status: "success",
    result: {
      attemptId,
      score,
      total: questionIds.length,
      language: attempt.language,
      review,
    },
    newBadges,
    streakNotes: streakNotes(activity, t),
  };
}
