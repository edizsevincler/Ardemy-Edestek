import { prisma } from "@/lib/prisma";
import { dateKey, displayStreak } from "@/lib/streak";
import { ttlCached } from "@/lib/ttl-cache";

export type RankingKind = "lessons" | "cards" | "streak" | "questions";
export type RankingPeriod = "week" | "all";

export type RankingRow = { userId: string; name: string; value: number };

export const RANKING_KINDS: RankingKind[] = ["lessons", "cards", "streak", "questions"];

// "Ahmet Yılmaz" -> "Ahmet Y." (sıralamada soyadı açık yazılmaz).
export function maskName(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length < 2) return parts[0] ?? "";
  const last = parts[parts.length - 1];
  return `${parts.slice(0, -1).join(" ")} ${last.charAt(0).toLocaleUpperCase("tr")}.`;
}

// n gün önceki an (admin sayfasındaki "son 7 gün" için).
export function daysAgo(n: number) {
  return new Date(Date.now() - n * 86_400_000);
}

// Bu haftanın başlangıcı: Pazartesi 00:00 (Türkiye saati, UTC+3 sabit).
function weekStart(now = new Date()) {
  const key = dateKey(now);
  const dow = new Date(`${key}T00:00:00Z`).getUTCDay(); // 0 = Pazar
  const back = (dow + 6) % 7;
  const monday = new Date(Date.parse(`${key}T00:00:00Z`) - back * 86_400_000);
  return new Date(`${monday.toISOString().slice(0, 10)}T00:00:00+03:00`);
}

// Kullanıcı başına değerleri, sıralamada görünmek isteyenlerle birleştirir.
async function toRows(values: Map<string, number>, studentsOnly = false): Promise<RankingRow[]> {
  const ids = [...values.entries()].filter(([, v]) => v > 0).map(([id]) => id);
  if (ids.length === 0) return [];
  const users = await prisma.user.findMany({
    where: {
      id: { in: ids },
      showInRanking: true,
      role: studentsOnly ? "STUDENT" : { not: "ADMIN" },
    },
    select: { id: true, name: true },
  });
  return users
    .map((u) => ({ userId: u.id, name: u.name, value: values.get(u.id) ?? 0 }))
    .sort((a, b) => b.value - a.value || a.name.localeCompare(b.name, "tr"));
}

async function load(kind: RankingKind, period: RankingPeriod): Promise<RankingRow[]> {
  const since = period === "week" ? weekStart() : undefined;

  if (kind === "lessons") {
    // Ders sayısı: öğrencinin ders dosyası olan farklı ders günleri.
    const files = await prisma.lessonFile.findMany({ select: { studentId: true, lessonDate: true, uploadedAt: true } });
    const days = new Map<string, Set<string>>();
    for (const f of files) {
      const set = days.get(f.studentId) ?? new Set<string>();
      set.add(dateKey(f.lessonDate ?? f.uploadedAt));
      days.set(f.studentId, set);
    }
    return toRows(new Map([...days].map(([id, set]) => [id, set.size])), true);
  }

  if (kind === "cards") {
    const groups = await prisma.cardReview.groupBy({
      by: ["userId"],
      where: since ? { createdAt: { gte: since } } : {},
      _count: { _all: true },
    });
    return toRows(new Map(groups.map((g) => [g.userId, g._count._all])));
  }

  if (kind === "streak") {
    const users = await prisma.user.findMany({
      where: { currentStreak: { gt: 0 } },
      select: { id: true, currentStreak: true, lastStreakDate: true, streakFreezes: true },
    });
    return toRows(
      new Map(users.map((u) => [u.id, displayStreak(u.currentStreak, u.lastStreakDate, u.streakFreezes)]))
    );
  }

  // questions: çözülen test + günün sorusu cevapları
  const [tests, daily] = await Promise.all([
    prisma.quizSubmission.groupBy({
      by: ["userId"],
      where: since ? { submittedAt: { gte: since } } : {},
      _count: { _all: true },
    }),
    prisma.dailyQuestionAnswer.groupBy({
      by: ["userId"],
      where: since ? { answeredAt: { gte: since } } : {},
      _count: { _all: true },
    }),
  ]);
  const values = new Map<string, number>();
  for (const g of [...tests, ...daily]) values.set(g.userId, (values.get(g.userId) ?? 0) + g._count._all);
  return toRows(values);
}

// Tüm sıralanmış liste (1 dakika önbellekte); sayfa ilk 20'yi ve kullanıcının yerini alır.
export function getRanking(kind: RankingKind, period: RankingPeriod): Promise<RankingRow[]> {
  const effective: RankingPeriod = kind === "lessons" || kind === "streak" ? "all" : period;
  return ttlCached(`ranking:${kind}:${effective}`, 60_000, () => load(kind, effective));
}
