"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { FREEZE_MAX, FREEZE_PRICE_CREDITS } from "@/lib/streak";
import { revalidatePath } from "next/cache";

type BuyResult = { status: "success" } | { status: "error"; message: string };

export async function buyStreakFreeze(): Promise<BuyResult> {
  const session = await auth();
  if (
    !session?.user ||
    (session.user.role !== "GUEST" && session.user.role !== "STUDENT")
  ) {
    return { status: "error", message: "Oturum bulunamadı." };
  }
  const userId = session.user.id;

  // Şartlar (yeterli kredi + üst sınır) tek atomik UPDATE içinde kontrol
  // edilir — çift tık/iki sekme ile kredi negatife düşemez, sınır aşılamaz.
  const result = await prisma.user.updateMany({
    where: {
      id: userId,
      credits: { gte: FREEZE_PRICE_CREDITS },
      streakFreezes: { lt: FREEZE_MAX },
    },
    data: {
      credits: { decrement: FREEZE_PRICE_CREDITS },
      streakFreezes: { increment: 1 },
    },
  });

  if (result.count === 0) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { streakFreezes: true },
    });
    if (user && user.streakFreezes >= FREEZE_MAX) {
      return {
        status: "error",
        message: `En fazla ${FREEZE_MAX} seri koruman olabilir.`,
      };
    }
    return { status: "error", message: "Yeterli krediniz yok." };
  }

  revalidatePath("/guest", "layout");
  revalidatePath("/student", "layout");
  return { status: "success" };
}
