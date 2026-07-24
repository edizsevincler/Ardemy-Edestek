"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

type UnlockState =
  | { status: "idle" }
  | { status: "error"; message: string }
  | { status: "success" };

export async function unlockQuestion(
  _prevState: UnlockState,
  formData: FormData
): Promise<UnlockState> {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== "GUEST" && session.user.role !== "STUDENT")
  ) {
    return { status: "error", message: "Oturum bulunamadı." };
  }

  const questionId = String(formData.get("questionId") ?? "");
  const question = await prisma.question.findUnique({ where: { id: questionId } });
  if (!question || !question.isPublished) {
    return { status: "error", message: "Bu soru artık mevcut değil." };
  }

  const existing = await prisma.questionUnlock.findUnique({
    where: {
      userId_questionId: { userId: session.user.id, questionId },
    },
  });
  if (existing) {
    return { status: "success" };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUniqueOrThrow({
        where: { id: session.user.id },
      });
      if (user.credits < question.creditCost) {
        throw new Error("INSUFFICIENT_CREDITS");
      }

      await tx.user.update({
        where: { id: user.id },
        data: { credits: { decrement: question.creditCost } },
      });

      await tx.questionUnlock.create({
        data: { userId: user.id, questionId },
      });
    });
  } catch (error) {
    if (error instanceof Error && error.message === "INSUFFICIENT_CREDITS") {
      return { status: "error", message: "Yeterli krediniz yok." };
    }
    throw error;
  }

  revalidatePath("/guest/questions");
  revalidatePath("/guest");

  return { status: "success" };
}
