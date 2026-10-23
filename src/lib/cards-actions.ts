"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { dateKey } from "@/lib/streak";
import { CARD_BONUS, CARD_BONUS_PRICE, getCardQuota, todayStart, type CardQuota } from "@/lib/card-quota";
import { getT } from "@/lib/i18n/server";
import { revalidatePath } from "next/cache";

// Bir kartın sonucunu kaydeder: "biliyorum" art arda sayacı artırır, "tekrar"
// sıfırlar. Her çalışma sıralama için CardReview'a da yazılır. Günlük ücretsiz
// destenin kartları ("q:" ile başlar) yalnızca sıralamaya sayılır. Günlük sınır
// dolduysa kaydedilmez (bkz. lib/card-quota.ts); güncel sınır durumu döner.
export async function recordCardReview(
  cardId: string,
  known: boolean
): Promise<{ ok: boolean; quota?: CardQuota | null }> {
  if (typeof cardId !== "string" || cardId.length > 80) return { ok: false };
  const session = await auth();
  if (!session?.user) return { ok: false };
  const userId = session.user.id;

  const quota = await getCardQuota(userId, session.user.role);
  if (quota && quota.used >= quota.limit) return { ok: false, quota };

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

// CARD_BONUS_PRICE kredi karşılığında bugün için CARD_BONUS kart daha açar. Kredi
// kontrolü ve düşümü tek atomik UPDATE içinde yapılır (çift tıkla kredi eksiye düşmez).
export async function buyCardBonus(): Promise<BonusResult> {
  const t = await getT();
  const session = await auth();
  if (!session?.user || (session.user.role !== "GUEST" && session.user.role !== "STUDENT")) {
    return { status: "error", message: t("Oturum bulunamadı.") };
  }
  const userId = session.user.id;
  const today = dateKey(todayStart());

  // Bugün daha önce alındıysa üstüne ekler, başka günün hakkıysa bugünden başlatır.
  const updated = await prisma.$executeRaw`
    UPDATE "User"
    SET credits = credits - ${CARD_BONUS_PRICE},
        "cardBonus" = CASE WHEN "cardBonusDay" = ${today} THEN "cardBonus" + ${CARD_BONUS} ELSE ${CARD_BONUS} END,
        "cardBonusDay" = ${today}
    WHERE id = ${userId} AND credits >= ${CARD_BONUS_PRICE}`;
  if (updated === 0) return { status: "error", message: t("Yeterli krediniz yok.") };

  revalidatePath("/guest", "layout");
  revalidatePath("/student", "layout");
  const quota = await getCardQuota(userId, session.user.role);
  return { status: "success", quota: quota! };
}
