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
