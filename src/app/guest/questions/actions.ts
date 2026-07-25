"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@/generated/prisma/client";
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
      // `updateMany` ile şart (credits >= cost) tek bir atomik UPDATE
      // içinde kontrol ediliyor — aynı hesaptan eşzamanlı (çift tık, iki
      // sekme) istekler gelse bile kredi negatife düşemez, çünkü Postgres
      // satırı ilk isteğe kilitler ve ikinci istek güncel bakiyeyi görür.
      const result = await tx.user.updateMany({
        where: { id: session.user.id, credits: { gte: question.creditCost } },
        data: { credits: { decrement: question.creditCost } },
      });
      if (result.count === 0) {
        throw new Error("INSUFFICIENT_CREDITS");
      }

      await tx.questionUnlock.create({
        data: { userId: session.user.id, questionId },
      });
    });
  } catch (error) {
    if (error instanceof Error && error.message === "INSUFFICIENT_CREDITS") {
      return { status: "error", message: "Yeterli krediniz yok." };
    }
    // Aynı soruyu eşzamanlı iki istek açmaya çalışırsa (çift tık, iki
    // sekme) ikinci istek burada unique constraint'e takılır — kredi zaten
    // güvenli şekilde geri alınmış olur (transaction rollback), kullanıcıya
    // hata göstermek yerine zaten açılmış say.
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { status: "success" };
    }
    throw error;
  }

  revalidatePath("/guest/questions");
  revalidatePath("/guest");

  return { status: "success" };
}
