import { prisma } from "@/lib/prisma";

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
  { id: "first-quiz", emoji: "🎯", title: "İlk Adım", description: "İlk testini çöz", stat: "quizCount", target: 1 },
  { id: "ten-quiz", emoji: "🏅", title: "Çalışkan", description: "10 test çöz", stat: "quizCount", target: 10 },
  { id: "25-quiz", emoji: "🏆", title: "Test Avcısı", description: "25 test çöz", stat: "quizCount", target: 25 },
  { id: "50-quiz", emoji: "🥇", title: "Yarım Yüzlük", description: "50 test çöz", stat: "quizCount", target: 50 },
  { id: "100-quiz", emoji: "💎", title: "Usta", description: "100 test çöz", stat: "quizCount", target: 100 },
  // Mükemmellik
  { id: "perfect", emoji: "⭐", title: "Mükemmel", description: "Bir testten %100 al", stat: "perfectCount", target: 1 },
  { id: "perfect3", emoji: "🏹", title: "Keskin Nişancı", description: "3 testten %100 al", stat: "perfectCount", target: 3 },
  { id: "perfect10", emoji: "👑", title: "Kusursuz", description: "10 testten %100 al", stat: "perfectCount", target: 10 },
  // Seri
  { id: "streak3", emoji: "✨", title: "Isınıyor", description: "3 günlük seri yap", stat: "longestStreak", target: 3 },
  { id: "streak7", emoji: "🔥", title: "Ateşli", description: "7 günlük seri yap", stat: "longestStreak", target: 7 },
  { id: "streak14", emoji: "💪", title: "Kararlı", description: "14 günlük seri yap", stat: "longestStreak", target: 14 },
  { id: "streak30", emoji: "🚀", title: "Durdurulamaz", description: "30 günlük seri yap", stat: "longestStreak", target: 30 },
  { id: "streak100", emoji: "🏔️", title: "Yüzlük Seri", description: "100 günlük seri yap", stat: "longestStreak", target: 100 },
  // Günün Sorusu
  { id: "daily5", emoji: "📅", title: "Günlük Alışkanlık", description: "5 Günün Sorusu'nu cevapla", stat: "dailyCount", target: 5 },
  { id: "daily10", emoji: "🗓️", title: "Düzenli", description: "10 Günün Sorusu'nu cevapla", stat: "dailyCount", target: 10 },
  { id: "daily30", emoji: "📆", title: "Vazgeçmez", description: "30 Günün Sorusu'nu cevapla", stat: "dailyCount", target: 30 },
  { id: "daily100", emoji: "🌟", title: "Günün Efsanesi", description: "100 Günün Sorusu'nu cevapla", stat: "dailyCount", target: 100 },
  { id: "daily-run5", emoji: "🧠", title: "Beş Doğru", description: "Günün Sorusu'nu art arda 5 kez doğru bil", stat: "dailyCorrectRun", target: 5 },
  // Keşif / sosyal
  { id: "explorer", emoji: "🧭", title: "Kaşif", description: "5 içerik aç", stat: "unlockCount", target: 5 },
  { id: "friend", emoji: "🤝", title: "Arkadaş Canlısı", description: "Bir arkadaşını getir", stat: "referralCount", target: 1 },
  // Konu / dil
  { id: "subject-master", emoji: "📚", title: "Konu Ustası", description: "Bir konudaki tüm testleri bitir", stat: "completedSubjects", target: 1 },
  { id: "polyglot", emoji: "🌍", title: "Çok Dilli", description: "İki farklı dilde test çöz", stat: "languageCount", target: 2 },
  // Zaman
  { id: "early-bird", emoji: "🌅", title: "Erkenci Kuş", description: "Sabah 05:00-08:00 arası çalış", stat: "earlyBird", target: 1 },
  { id: "night-owl", emoji: "🦉", title: "Gece Kuşu", description: "Gece 00:00-05:00 arası çalış", stat: "nightOwl", target: 1 },
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
export async function getBadges(userId: string): Promise<Badge[]> {
  const { badges } = await computeBadges(userId);
  return badges
    .map((b) => ({
      id: b.id,
      emoji: b.emoji,
      title: b.title,
      description: b.description,
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
): Promise<{ emoji: string; title: string }[]> {
  const { badges, persistedIds } = await computeBadges(userId);
  const fresh = badges.filter((b) => b.qualifiesNow && !persistedIds.has(b.id));
  if (fresh.length === 0) return [];

  await prisma.userBadge.createMany({
    data: fresh.map((b) => ({ userId, badgeId: b.id })),
    skipDuplicates: true,
  });
  return fresh.map((b) => ({ emoji: b.emoji, title: b.title }));
}
