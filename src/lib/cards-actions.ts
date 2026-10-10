"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

// Bir kartın sonucunu kaydeder: "biliyorum" art arda sayacı artırır, "tekrar"
// sıfırlar. Her çalışma sıralama için CardReview'a da yazılır. Günlük ücretsiz
// destenin kartları ("q:" ile başlar) yalnızca sıralamaya sayılır.
export async function recordCardReview(cardId: string, known: boolean) {
  if (typeof cardId !== "string" || cardId.length > 80) return { ok: false };
  const session = await auth();
  if (!session?.user) return { ok: false };
  const userId = session.user.id;

  await prisma.cardReview.create({ data: { userId, known: !!known } });
  if (cardId.startsWith("q:")) return { ok: true };

  await prisma.flashCard.updateMany({
    where: { id: cardId, userId },
    data: {
      knownStreak: known ? { increment: 1 } : 0,
      seen: { increment: 1 },
      lastSeenAt: new Date(),
    },
  });
  return { ok: true };
}
