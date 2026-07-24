"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type GradeState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success" };

export async function gradeAnswer(
  _prevState: GradeState,
  formData: FormData
): Promise<GradeState> {
  const answerId = String(formData.get("answerId") ?? "");
  const questionId = String(formData.get("questionId") ?? "");
  const feedback = String(formData.get("feedback") ?? "").trim();

  if (!feedback) {
    return { status: "error", message: "Geri bildirim boş olamaz." };
  }

  await prisma.questionAnswer.update({
    where: { id: answerId },
    data: { feedback, gradedAt: new Date() },
  });

  revalidatePath(`/admin/questions/${questionId}/answers`);

  return { status: "success" };
}
