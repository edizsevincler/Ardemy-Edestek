"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// Bir kartın sonucunu kaydeder: "biliyorum" art arda sayacı artırır, "tekrar"
// sıfırlar. Günlük ücretsiz destenin kartları ("q:" ile başlar) kaydedilmez.
export async function recordCardReview(cardId: string, known: boolean) {
  if (typeof cardId !== "string" || cardId.startsWith("q:")) return { ok: true };
  const session = await auth();
  if (!session?.user) return { ok: false };

  await prisma.flashCard.updateMany({
    where: { id: cardId, userId: session.user.id },
    data: {
      knownStreak: known ? { increment: 1 } : 0,
      seen: { increment: 1 },
      lastSeenAt: new Date(),
    },
  });
  return { ok: true };
}
