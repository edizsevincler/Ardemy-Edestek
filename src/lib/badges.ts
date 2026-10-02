import { prisma } from "@/lib/prisma";

export type BadgeStats = {
  quizCount: number;
  perfectCount: number;
  longestStreak: number;
  unlockCount: number;
  referralCount: number;
  dailyCount: number;
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

const DEFINITIONS: {
  id: string;
  emoji: string;
  title: string;
  description: string;
  stat: keyof BadgeStats;
  target: number;
}[] = [
  { id: "first-quiz", emoji: "🎯", title: "İlk Adım", description: "İlk testini çöz", stat: "quizCount", target: 1 },
  { id: "ten-quiz", emoji: "🏅", title: "Çalışkan", description: "10 test çöz", stat: "quizCount", target: 10 },
  { id: "25-quiz", emoji: "🏆", title: "Test Avcısı", description: "25 test çöz", stat: "quizCount", target: 25 },
  { id: "perfect", emoji: "⭐", title: "Mükemmel", description: "Bir testten %100 al", stat: "perfectCount", target: 1 },
  { id: "streak7", emoji: "🔥", title: "Ateşli", description: "7 günlük seri yap", stat: "longestStreak", target: 7 },
  { id: "streak30", emoji: "🚀", title: "Durdurulamaz", description: "30 günlük seri yap", stat: "longestStreak", target: 30 },
  { id: "explorer", emoji: "🧭", title: "Kaşif", description: "5 içerik aç", stat: "unlockCount", target: 5 },
  { id: "daily5", emoji: "📅", title: "Günlük Alışkanlık", description: "5 Günün Sorusu'nu cevapla", stat: "dailyCount", target: 5 },
  { id: "friend", emoji: "🤝", title: "Arkadaş Canlısı", description: "Bir arkadaşını getir", stat: "referralCount", target: 1 },
];

export async function getBadges(userId: string): Promise<Badge[]> {
  const [user, submissions, unlockCount, referralCount, dailyCount] =
    await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { longestStreak: true },
      }),
      prisma.quizSubmission.findMany({
        where: { userId },
        select: { score: true, total: true },
      }),
      prisma.questionUnlock.count({ where: { userId } }),
      prisma.user.count({ where: { referredById: userId } }),
      prisma.dailyQuestionAnswer.count({ where: { userId } }),
    ]);

  const stats: BadgeStats = {
    quizCount: submissions.length,
    perfectCount: submissions.filter((s) => s.total > 0 && s.score === s.total)
      .length,
    longestStreak: user?.longestStreak ?? 0,
    unlockCount,
    referralCount,
    dailyCount,
  };

  return DEFINITIONS.map((def) => {
    const current = stats[def.stat];
    return {
      id: def.id,
      emoji: def.emoji,
      title: def.title,
      description: def.description,
      current,
      target: def.target,
      earned: current >= def.target,
    };
  });
}
