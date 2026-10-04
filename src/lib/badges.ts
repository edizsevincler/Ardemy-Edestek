import { prisma } from "@/lib/prisma";
import { tx } from "@/lib/i18n/translate";
import { getT } from "@/lib/i18n/server";

export type BadgeStats = {
  quizCount: number;
  perfectCount: number;
  longestStreak: number;
  unlockCount: number;
  referralCount: number;
  dailyCount: number;
  dailyCorrectRun: number;
  completedSubjects: number;
  languageCount: number;
  earlyBird: number;
  nightOwl: number;
};

export type Badge = {
  id: string;
  emoji: string;
  title: string;
  description: string;
  current: number;
  target: number;
  earned: boolean;
};

type Definition = {
  id: string;
  emoji: string;
  title: string;
  description: string;
  stat: keyof BadgeStats;
  target: number;
};

const DEFINITIONS: Definition[] = [
  // Test sayısı
  { id: "first-quiz", emoji: "🎯", title: tx("İlk Adım"), description: tx("İlk testini çöz"), stat: "quizCount", target: 1 },
  { id: "ten-quiz", emoji: "🏅", title: tx("Çalışkan"), description: tx("10 test çöz"), stat: "quizCount", target: 10 },
  { id: "25-quiz", emoji: "🏆", title: tx("Test Avcısı"), description: tx("25 test çöz"), stat: "quizCount", target: 25 },
  { id: "50-quiz", emoji: "🥇", title: tx("Yarım Yüzlük"), description: tx("50 test çöz"), stat: "quizCount", target: 50 },
  { id: "100-quiz", emoji: "💎", title: tx("Usta"), description: tx("100 test çöz"), stat: "quizCount", target: 100 },
  // Mükemmellik
  { id: "perfect", emoji: "⭐", title: tx("Mükemmel"), description: tx("Bir testten %100 al"), stat: "perfectCount", target: 1 },
  { id: "perfect3", emoji: "🏹", title: tx("Keskin Nişancı"), description: tx("3 testten %100 al"), stat: "perfectCount", target: 3 },
  { id: "perfect10", emoji: "👑", title: tx("Kusursuz"), description: tx("10 testten %100 al"), stat: "perfectCount", target: 10 },
  // Seri
  { id: "streak3", emoji: "✨", title: tx("Isınıyor"), description: tx("3 günlük seri yap"), stat: "longestStreak", target: 3 },
  { id: "streak7", emoji: "🔥", title: tx("Ateşli"), description: tx("7 günlük seri yap"), stat: "longestStreak", target: 7 },
  { id: "streak14", emoji: "💪", title: tx("Kararlı"), description: tx("14 günlük seri yap"), stat: "longestStreak", target: 14 },
  { id: "streak30", emoji: "🚀", title: tx("Durdurulamaz"), description: tx("30 günlük seri yap"), stat: "longestStreak", target: 30 },
  { id: "streak100", emoji: "🏔️", title: tx("Yüzlük Seri"), description: tx("100 günlük seri yap"), stat: "longestStreak", target: 100 },
  // Günün Sorusu
  { id: "daily5", emoji: "📅", title: tx("Günlük Alışkanlık"), description: tx("5 Günün Sorusu'nu cevapla"), stat: "dailyCount", target: 5 },
  { id: "daily10", emoji: "🗓️", title: tx("Düzenli"), description: tx("10 Günün Sorusu'nu cevapla"), stat: "dailyCount", target: 10 },
  { id: "daily30", emoji: "📆", title: tx("Vazgeçmez"), description: tx("30 Günün Sorusu'nu cevapla"), stat: "dailyCount", target: 30 },
  { id: "daily100", emoji: "🌟", title: tx("Günün Efsanesi"), description: tx("100 Günün Sorusu'nu cevapla"), stat: "dailyCount", target: 100 },
  { id: "daily-run5", emoji: "🧠", title: tx("Beş Doğru"), description: tx("Günün Sorusu'nu art arda 5 kez doğru bil"), stat: "dailyCorrectRun", target: 5 },
  // Keşif / sosyal
  { id: "explorer", emoji: "🧭", title: tx("Kaşif"), description: tx("5 içerik aç"), stat: "unlockCount", target: 5 },
  { id: "friend", emoji: "🤝", title: tx("Arkadaş Canlısı"), description: tx("Bir arkadaşını getir"), stat: "referralCount", target: 1 },
  // Konu / dil
  { id: "subject-master", emoji: "📚", title: tx("Konu Ustası"), description: tx("Bir konudaki tüm testleri bitir"), stat: "completedSubjects", target: 1 },
  { id: "polyglot", emoji: "🌍", title: tx("Çok Dilli"), description: tx("İki farklı dilde test çöz"), stat: "languageCount", target: 2 },
  // Zaman
  { id: "early-bird", emoji: "🌅", title: tx("Erkenci Kuş"), description: tx("Sabah 05:00-08:00 arası çalış"), stat: "earlyBird", target: 1 },
  { id: "night-owl", emoji: "🦉", title: tx("Gece Kuşu"), description: tx("Gece 00:00-05:00 arası çalış"), stat: "nightOwl", target: 1 },
];

function istanbulHour(date: Date) {
  const hour = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Istanbul",
    hour: "2-digit",
    hourCycle: "h23",
  }).format(date);
  return parseInt(hour, 10);
}

async function computeStats(userId: string): Promise<BadgeStats> {
  const [user, submissions, unlockCount, referralCount, dailyAnswers, quizzes] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { longestStreak: true },
      }),
      prisma.quizSubmission.findMany({
        where: { userId },
        select: { score: true, total: true, questionId: true, submittedAt: true },
      }),
      prisma.questionUnlock.count({ where: { userId } }),
      prisma.user.count({ where: { referredById: userId } }),
      prisma.dailyQuestionAnswer.findMany({
        where: { userId },
        orderBy: { answeredAt: "asc" },
        select: { correct: true, answeredAt: true },
      }),
      prisma.question.findMany({
        where: { isPublished: true, type: "QUIZ" },
        select: { id: true, subject: true },
      }),
    ]);

  const submittedIds = new Set(submissions.map((s) => s.questionId));

  const quizzesBySubject = new Map<string, string[]>();
  const languageBySubmittedQuiz = new Set<string>();
  for (const q of quizzes) {
    const ids = quizzesBySubject.get(q.subject) ?? [];
    ids.push(q.id);
    quizzesBySubject.set(q.subject, ids);
    if (submittedIds.has(q.id)) {
      languageBySubmittedQuiz.add(q.subject.split(" - ")[0].trim());
    }
  }
  const completedSubjects = Array.from(quizzesBySubject.values()).filter(
    (ids) => ids.length > 0 && ids.every((id) => submittedIds.has(id))
  ).length;

  let bestRun = 0;
  let run = 0;
  for (const a of dailyAnswers) {
    run = a.correct ? run + 1 : 0;
    bestRun = Math.max(bestRun, run);
  }

  const hours = [
    ...submissions.map((s) => istanbulHour(s.submittedAt)),
    ...dailyAnswers.map((a) => istanbulHour(a.answeredAt)),
  ];

  return {
    quizCount: submissions.length,
    perfectCount: submissions.filter((s) => s.total > 0 && s.score === s.total)
      .length,
    longestStreak: user?.longestStreak ?? 0,
    unlockCount,
    referralCount,
    dailyCount: dailyAnswers.length,
    dailyCorrectRun: bestRun,
    completedSubjects,
    languageCount: languageBySubmittedQuiz.size,
    earlyBird: hours.some((h) => h >= 5 && h < 8) ? 1 : 0,
    nightOwl: hours.some((h) => h >= 0 && h < 5) ? 1 : 0,
  };
}

async function computeBadges(userId: string) {
  const [stats, persisted] = await Promise.all([
    computeStats(userId),
    prisma.userBadge.findMany({ where: { userId }, select: { badgeId: true } }),
  ]);
  const persistedIds = new Set(persisted.map((p) => p.badgeId));

  const badges: (Badge & { qualifiesNow: boolean })[] = DEFINITIONS.map(
    (def) => {
      const current = stats[def.stat];
      const qualifiesNow = current >= def.target;
      return {
        id: def.id,
        emoji: def.emoji,
        title: def.title,
        description: def.description,
        current,
        target: def.target,
        earned: qualifiesNow || persistedIds.has(def.id),
        qualifiesNow,
      };
    }
  );
  return { badges, persistedIds };
}

// Panelde gösterim için: kazanılanlar önce.
// Ana sayfadaki rozet vitrini için: seçilen rozetlerin çevrilmemiş tanımları
// (gösterirken t() ile çevrilir).
export function previewBadges(ids: string[]) {
  return ids
    .map((id) => DEFINITIONS.find((d) => d.id === id))
    .filter((d): d is Definition => !!d)
    .map(({ id, emoji, title, description }) => ({ id, emoji, title, description }));
}

export async function getBadges(userId: string): Promise<Badge[]> {
  const t = await getT();
  const { badges } = await computeBadges(userId);
  return badges
    .map((b) => ({
      id: b.id,
      emoji: b.emoji,
      title: t(b.title),
      description: t(b.description),
      current: b.current,
      target: b.target,
      earned: b.earned,
    }))
    .sort((a, b) => Number(b.earned) - Number(a.earned));
}

// Test/soru sonrası çağrılır: yeni hak edilen rozetleri kalıcı kaydeder ve
// kutlama göstermek için döndürür.
export async function awardBadges(
  userId: string
): Promise<{ id: string; emoji: string; title: string }[]> {
  const { badges, persistedIds } = await computeBadges(userId);
  const fresh = badges.filter((b) => b.qualifiesNow && !persistedIds.has(b.id));
  if (fresh.length === 0) return [];

  await prisma.userBadge.createMany({
    data: fresh.map((b) => ({ userId, badgeId: b.id })),
    skipDuplicates: true,
  });
  const t = await getT();
  return fresh.map((b) => ({ id: b.id, emoji: b.emoji, title: t(b.title) }));
}
