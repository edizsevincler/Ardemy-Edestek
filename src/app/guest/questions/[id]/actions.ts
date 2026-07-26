"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { saveUploadedFile } from "@/lib/storage";
import { revalidatePath } from "next/cache";

type SubmitAnswerState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success" };

export async function submitAnswer(
  _prevState: SubmitAnswerState,
  formData: FormData
): Promise<SubmitAnswerState> {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== "GUEST" && session.user.role !== "STUDENT")
  ) {
    return { status: "error", message: "Oturum bulunamadı." };
  }

  const questionId = String(formData.get("questionId") ?? "");
  const body = String(formData.get("body") ?? "").trim();
  const file = formData.get("file");

  const unlock = await prisma.questionUnlock.findUnique({
    where: {
      userId_questionId: { userId: session.user.id, questionId },
    },
  });
  if (!unlock) {
    return { status: "error", message: "Bu soruyu henüz açmadınız." };
  }

  const hasFile = file instanceof File && file.size > 0;
  if (!body && !hasFile) {
    return { status: "error", message: "Bir cevap yazın veya dosya ekleyin." };
  }

  let fileUrl: string | undefined;
  let fileName: string | undefined;
  if (hasFile) {
    const saved = await saveUploadedFile(file as File, "question-answers");
    fileUrl = saved.fileUrl;
    fileName = saved.fileName;
  }

  await prisma.questionAnswer.upsert({
    where: {
      userId_questionId: { userId: session.user.id, questionId },
    },
    // Yeniden gönderim, önceki geri bildirimi geçersiz kılar — hoca yeni
    // cevabı tekrar değerlendirmeli.
    update: {
      body: body || null,
      ...(hasFile ? { fileUrl, fileName } : {}),
      submittedAt: new Date(),
      feedback: null,
      gradedAt: null,
    },
    create: {
      userId: session.user.id,
      questionId,
      body: body || null,
      fileUrl,
      fileName,
    },
  });

  revalidatePath(`/guest/questions/${questionId}`);
  revalidatePath(`/admin/questions/${questionId}/answers`);

  return { status: "success" };
}

type QuizOptionLetter = "A" | "B" | "C" | "D";

type SubmitQuizResult =
  | { status: "error"; message: string }
  | {
      status: "success";
      score: number;
      total: number;
      answers: { itemId: string; selected: QuizOptionLetter; correct: boolean }[];
    };

export async function submitQuiz(
  questionId: string,
  answers: Record<string, QuizOptionLetter>
): Promise<SubmitQuizResult> {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== "GUEST" && session.user.role !== "STUDENT")
  ) {
    return { status: "error", message: "Oturum bulunamadı." };
  }

  const unlock = await prisma.questionUnlock.findUnique({
    where: { userId_questionId: { userId: session.user.id, questionId } },
  });
  if (!unlock) {
    return { status: "error", message: "Bu testi henüz açmadınız." };
  }

  const items = await prisma.quizItem.findMany({ where: { questionId } });
  if (items.length === 0) {
    return { status: "error", message: "Bu test için soru bulunamadı." };
  }

  const graded = items.map((item) => {
    const selected = answers[item.id];
    return {
      itemId: item.id,
      selected: selected ?? null,
      correct: selected === item.correct,
    };
  });

  if (graded.some((g) => !g.selected)) {
    return { status: "error", message: "Lütfen tüm soruları cevaplayın." };
  }

  const score = graded.filter((g) => g.correct).length;

  await prisma.quizSubmission.upsert({
    where: { userId_questionId: { userId: session.user.id, questionId } },
    update: { score, total: items.length, answers: graded, submittedAt: new Date() },
    create: {
      userId: session.user.id,
      questionId,
      score,
      total: items.length,
      answers: graded,
    },
  });

  revalidatePath(`/guest/questions/${questionId}`);

  return {
    status: "success",
    score,
    total: items.length,
    answers: graded as { itemId: string; selected: QuizOptionLetter; correct: boolean }[],
  };
}
