"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { CARD_BONUS, CARD_BONUS_PRICE, CARD_PERIOD_MS, getCardQuota, type CardQuota } from "@/lib/card-quota";
import { getT } from "@/lib/i18n/server";
import { revalidatePath } from "next/cache";

// Bir kartın sonucunu kaydeder: "biliyorum" art arda sayacı artırır, "tekrar"
// sıfırlar. Her çalışma sıralama için CardReview'a da yazılır. Günlük ücretsiz
// destenin kartları ("q:" ile başlar) yalnızca sıralamaya sayılır. Dönem sınırı
// dolduysa kaydedilmez (bkz. lib/card-quota.ts); güncel sınır durumu döner.
export async function recordCardReview(
  cardId: string,
  known: boolean
): Promise<{ ok: boolean; quota?: CardQuota | null }> {
  if (typeof cardId !== "string" || cardId.length > 80) return { ok: false };
  const session = await auth();
  if (!session?.user) return { ok: false };
  const userId = session.user.id;

  let quota = await getCardQuota(userId, session.user.role);
  if (quota && quota.used >= quota.limit) return { ok: false, quota };

  // Dönem yoksa (ya da süresi dolduysa) bu kartla yeni 24 saatlik dönem başlar.
  if (quota && quota.resetAt === null) {
    const now = new Date();
    await prisma.user.updateMany({
      where: {
        id: userId,
        OR: [{ cardPeriodStart: null }, { cardPeriodStart: { lte: new Date(now.getTime() - CARD_PERIOD_MS) } }],
      },
      data: { cardPeriodStart: now, cardBonus: 0 },
    });
    quota = await getCardQuota(userId, session.user.role);
  }

  await prisma.cardReview.create({ data: { userId, known: !!known } });
  if (!cardId.startsWith("q:")) {
    await prisma.flashCard.updateMany({
      where: { id: cardId, userId },
      data: {
        knownStreak: known ? { increment: 1 } : 0,
        seen: { increment: 1 },
        lastSeenAt: new Date(),
      },
    });
  }
  return { ok: true, quota: quota && { ...quota, used: quota.used + 1 } };
}

type BonusResult = { status: "success"; quota: CardQuota } | { status: "error"; message: string };

// CARD_BONUS_PRICE kredi karşılığında süren döneme CARD_BONUS kart daha ekler. Kredi
// kontrolü ve düşümü tek atomik UPDATE içinde yapılır (çift tıkla kredi eksiye düşmez).
export async function buyCardBonus(): Promise<BonusResult> {
  const t = await getT();
  const session = await auth();
  if (!session?.user || (session.user.role !== "GUEST" && session.user.role !== "STUDENT")) {
    return { status: "error", message: t("Oturum bulunamadı.") };
  }
  const userId = session.user.id;
  const cutoff = new Date(Date.now() - CARD_PERIOD_MS);

  const updated = await prisma.user.updateMany({
    where: { id: userId, credits: { gte: CARD_BONUS_PRICE }, cardPeriodStart: { gt: cutoff } },
    data: { credits: { decrement: CARD_BONUS_PRICE }, cardBonus: { increment: CARD_BONUS } },
  });
  if (updated.count === 0) {
    const quota = await getCardQuota(userId, session.user.role);
    // Dönem bu arada bittiyse ücretsiz hak zaten yenilendi: kredi harcatmadan devam.
    if (quota && quota.used < quota.limit) return { status: "success", quota };
    return { status: "error", message: t("Yeterli krediniz yok.") };
  }

  revalidatePath("/guest", "layout");
  revalidatePath("/student", "layout");
  const quota = await getCardQuota(userId, session.user.role);
  return { status: "success", quota: quota! };
}
