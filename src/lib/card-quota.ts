import { prisma } from "@/lib/prisma";
import { dateKey } from "@/lib/streak";
import { DAILY_CARD_LIMIT } from "@/lib/card-meta";

// Kelime kartlarında günlük sınır: her kullanıcı günde DAILY_CARD_LIMIT kart çalışır;
// CARD_BONUS_PRICE kredi ile o gün için CARD_BONUS kart daha açar (sabitler
// lib/card-meta.ts'te). Gün İstanbul saatine göre gece yarısı yenilenir
// (Türkiye'de yaz saati yok, UTC+3 sabit).
export { DAILY_CARD_LIMIT, CARD_BONUS, CARD_BONUS_PRICE } from "@/lib/card-meta";

export type CardQuota = {
  used: number;
  limit: number;
  credits: number;
  resetAt: string; // bir sonraki gece yarısı (ISO)
};

export function todayStart(now = new Date()) {
  return new Date(`${dateKey(now)}T00:00:00+03:00`);
}

// Yöneticiler sınırsızdır (null).
export async function getCardQuota(userId: string, role: string): Promise<CardQuota | null> {
  if (role === "ADMIN") return null;
  const start = todayStart();
  const [used, user] = await Promise.all([
    prisma.cardReview.count({ where: { userId, createdAt: { gte: start } } }),
    prisma.user.findUnique({ where: { id: userId }, select: { credits: true, cardBonusDay: true, cardBonus: true } }),
  ]);
  const bonus = user?.cardBonusDay === dateKey(start) ? user.cardBonus : 0;
  return {
    used,
    limit: DAILY_CARD_LIMIT + bonus,
    credits: user?.credits ?? 0,
    resetAt: new Date(start.getTime() + 86_400_000).toISOString(),
  };
}
