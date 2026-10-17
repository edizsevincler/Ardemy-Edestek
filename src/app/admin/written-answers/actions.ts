"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

type GradeState = { status: "idle" } | { status: "error"; message: string } | { status: "success" };

// Eğitmenin yazılı test gönderimine geri bildirimi (öğrenci kendi test sayfasında görür).
export async function gradeWrittenSubmission(_prev: GradeState, formData: FormData): Promise<GradeState> {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return { status: "error", message: "Yetkisiz." };

  const id = String(formData.get("submissionId") ?? "");
  const feedback = String(formData.get("feedback") ?? "").trim();
  if (!feedback) return { status: "error", message: "Geri bildirim boş olamaz." };

  const submission = await prisma.writtenSubmission.update({
    where: { id },
    data: { feedback, gradedAt: new Date() },
  });

  revalidatePath("/admin/written-answers");
  revalidatePath(`/admin/questions/${submission.questionId}/answers`);
  revalidatePath(`/guest/questions/${submission.questionId}`);
  return { status: "success" };
}
