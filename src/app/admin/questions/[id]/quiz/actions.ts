"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type UpdateQuizItemState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success" };

export async function updateQuizItem(
  _prevState: UpdateQuizItemState,
  formData: FormData
): Promise<UpdateQuizItemState> {
  const id = String(formData.get("id") ?? "");
  const questionId = String(formData.get("questionId") ?? "");
  const prompt = String(formData.get("prompt") ?? "").trim();
  const optionA = String(formData.get("optionA") ?? "").trim();
  const optionB = String(formData.get("optionB") ?? "").trim();
  const optionC = String(formData.get("optionC") ?? "").trim();
  const optionD = String(formData.get("optionD") ?? "").trim();
  const correct = String(formData.get("correct") ?? "");

  if (!prompt || !optionA || !optionB || !optionC || !optionD) {
    return { status: "error", message: "Tüm alanlar doldurulmalı." };
  }
  if (!["A", "B", "C", "D"].includes(correct)) {
    return { status: "error", message: "Doğru şık seçilmeli." };
  }

  await prisma.quizItem.update({
    where: { id },
    data: {
      prompt,
      optionA,
      optionB,
      optionC,
      optionD,
      correct: correct as "A" | "B" | "C" | "D",
    },
  });

  revalidatePath(`/admin/questions/${questionId}/quiz`);

  return { status: "success" };
}
