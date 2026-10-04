import { prisma } from "@/lib/prisma";

// Yönetici paneli için kayıtlı kullanıcıların etkinlikleri. Anonim ziyaretçiler
// burada yer almaz (onlar yalnızca günlük sayaçla izlenir, bkz. pageviews.ts).

export type ActivityEvent = {
  at: Date;
  emoji: string;
  text: string;
};

const PER_SOURCE = 15;

// Son hareketler akışı: kayıt, test, günün sorusu, deneme sınavı, kredi
// alımı ve soru açma olayları zaman sırasına dizilir.
export async function getRecentActivity(limit = 20): Promise<ActivityEvent[]> {
  const [signups, quizzes, dailies, exams, purchases, unlocks] = await Promise.all([
    prisma.user.findMany({
      where: { role: { in: ["GUEST", "STUDENT"] } },
      orderBy: { createdAt: "desc" },
      take: PER_SOURCE,
      select: { name: true, role: true, createdAt: true, signupSource: true },
    }),
    prisma.quizSubmission.findMany({
      orderBy: { submittedAt: "desc" },
      take: PER_SOURCE,
      select: {
        score: true,
        total: true,
        submittedAt: true,
        user: { select: { name: true } },
        question: { select: { title: true } },
      },
    }),
    prisma.dailyQuestionAnswer.findMany({
      orderBy: { answeredAt: "desc" },
      take: PER_SOURCE,
      select: { correct: true, answeredAt: true, user: { select: { name: true } } },
    }),
    prisma.examAttempt.findMany({
      where: { submittedAt: { not: null } },
      orderBy: { submittedAt: "desc" },
      take: PER_SOURCE,
      select: {
        language: true,
        score: true,
        total: true,
        submittedAt: true,
        user: { select: { name: true } },
      },
    }),
    prisma.creditPurchase.findMany({
      orderBy: { createdAt: "desc" },
      take: PER_SOURCE,
      select: {
        credits: true,
        status: true,
        createdAt: true,
        user: { select: { name: true } },
      },
    }),
    prisma.questionUnlock.findMany({
      orderBy: { unlockedAt: "desc" },
      take: PER_SOURCE,
      select: {
        unlockedAt: true,
        user: { select: { name: true } },
        question: { select: { title: true } },
      },
    }),
  ]);

  const events: ActivityEvent[] = [];

  for (const u of signups) {
    events.push({
      at: u.createdAt,
      emoji: "🆕",
      text: `${u.name} kayıt oldu${u.signupSource ? ` (kaynak: ${u.signupSource})` : ""}`,
    });
  }
  for (const q of quizzes) {
    events.push({
      at: q.submittedAt,
      emoji: "📝",
      text: `${q.user.name} “${q.question.title}” testini çözdü (${q.score}/${q.total})`,
    });
  }
  for (const d of dailies) {
    events.push({
      at: d.answeredAt,
      emoji: d.correct ? "✅" : "📅",
      text: `${d.user.name} günün sorusunu ${d.correct ? "doğru" : "yanlış"} cevapladı`,
    });
  }
  for (const e of exams) {
    if (!e.submittedAt) continue;
    events.push({
      at: e.submittedAt,
      emoji: "🎓",
      text: `${e.user.name} ${e.language} deneme sınavını bitirdi (${e.score ?? 0}/${e.total})`,
    });
  }
  for (const p of purchases) {
    const status =
      p.status === "PAID" ? "satın aldı" : p.status === "PENDING" ? "satın alma talebi oluşturdu" : "satın alma denedi";
    events.push({
      at: p.createdAt,
      emoji: p.status === "PAID" ? "💰" : "🧾",
      text: `${p.user.name} ${p.credits} kredi ${status}`,
    });
  }
  for (const u of unlocks) {
    events.push({
      at: u.unlockedAt,
      emoji: "🔓",
      text: `${u.user.name} “${u.question.title}” içeriğini açtı`,
    });
  }

  return events.sort((a, b) => b.at.getTime() - a.at.getTime()).slice(0, limit);
}

export type UserActivity = {
  lastActiveAt: Date | null;
  tests: number;
  dailies: number;
  exams: number;
};

// Verilen kullanıcıların etkinlik özeti (son aktiflik + sayılar). Tek seferde
// toplu sorgularla hesaplanır; satır başına sorgu atılmaz.
export async function getUserActivity(
  users: { id: string; lastLoginAt: Date | null }[]
): Promise<Map<string, UserActivity>> {
  const ids = users.map((u) => u.id);
  const [quizzes, dailies, exams, unlocks] = await Promise.all([
    prisma.quizSubmission.groupBy({
      by: ["userId"],
      where: { userId: { in: ids } },
      _count: { _all: true },
      _max: { submittedAt: true },
    }),
    prisma.dailyQuestionAnswer.groupBy({
      by: ["userId"],
      where: { userId: { in: ids } },
      _count: { _all: true },
      _max: { answeredAt: true },
    }),
    prisma.examAttempt.groupBy({
      by: ["userId"],
      where: { userId: { in: ids }, submittedAt: { not: null } },
      _count: { _all: true },
      _max: { submittedAt: true },
    }),
    prisma.questionUnlock.groupBy({
      by: ["userId"],
      where: { userId: { in: ids } },
      _max: { unlockedAt: true },
    }),
  ]);

  const quizMap = new Map(quizzes.map((r) => [r.userId, r]));
  const dailyMap = new Map(dailies.map((r) => [r.userId, r]));
  const examMap = new Map(exams.map((r) => [r.userId, r]));
  const unlockMap = new Map(unlocks.map((r) => [r.userId, r]));

  const result = new Map<string, UserActivity>();
  for (const user of users) {
    const times = [
      user.lastLoginAt,
      quizMap.get(user.id)?._max.submittedAt,
      dailyMap.get(user.id)?._max.answeredAt,
      examMap.get(user.id)?._max.submittedAt,
      unlockMap.get(user.id)?._max.unlockedAt,
    ].filter((d): d is Date => !!d);
    result.set(user.id, {
      lastActiveAt: times.length ? new Date(Math.max(...times.map((d) => d.getTime()))) : null,
      tests: quizMap.get(user.id)?._count._all ?? 0,
      dailies: dailyMap.get(user.id)?._count._all ?? 0,
      exams: examMap.get(user.id)?._count._all ?? 0,
    });
  }
  return result;
}

// "3 saat önce", "dün", "5 gün önce" gibi kısa Türkçe zaman ifadesi.
export function timeAgoTr(date: Date, now = new Date()): string {
  const seconds = Math.max(0, Math.round((now.getTime() - date.getTime()) / 1000));
  if (seconds < 60) return "az önce";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} dk önce`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} saat önce`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "dün";
  if (days < 30) return `${days} gün önce`;
  return date.toLocaleDateString("tr-TR");
}
