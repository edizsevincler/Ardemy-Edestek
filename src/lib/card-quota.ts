import { prisma } from "@/lib/prisma";
import { DAILY_CARD_LIMIT } from "@/lib/card-meta";

// Kelime kartı sınırı: 24 saatlik dönemde DAILY_CARD_LIMIT kart. Dönem, önceki dönem
// bittikten sonra çalışılan ilk kartla başlar; böylece gece yarısı gibi sabit bir
// sıfırlama anı yoktur (23:59'da başlayıp 00:01'de yeni hak alınamaz).
// CARD_BONUS_PRICE kredi ile o döneme CARD_BONUS kart eklenir (sabitler lib/card-meta.ts'te).
export { DAILY_CARD_LIMIT, CARD_BONUS, CARD_BONUS_PRICE } from "@/lib/card-meta";
export const CARD_PERIOD_MS = 24 * 60 * 60 * 1000;

export type CardQuota = {
  used: number;
  limit: number;
  credits: number;
  resetAt: string | null; // dönemin bittiği an (ISO); dönem başlamadıysa null
};

// Süresi dolmamış dönemin başlangıcı (yoksa null).
export function activePeriodStart(start: Date | null | undefined, now = Date.now()) {
  return start && now - start.getTime() < CARD_PERIOD_MS ? start : null;
}

// Yöneticiler sınırsızdır (null).
export async function getCardQuota(userId: string, role: string): Promise<CardQuota | null> {
  if (role === "ADMIN") return null;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { credits: true, cardPeriodStart: true, cardBonus: true },
  });
  const start = activePeriodStart(user?.cardPeriodStart);
  const used = start ? await prisma.cardReview.count({ where: { userId, createdAt: { gte: start } } }) : 0;
  return {
    used,
    limit: DAILY_CARD_LIMIT + (start ? (user?.cardBonus ?? 0) : 0),
    credits: user?.credits ?? 0,
    resetAt: start ? new Date(start.getTime() + CARD_PERIOD_MS).toISOString() : null,
  };
}
