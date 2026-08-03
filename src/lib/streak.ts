import { prisma } from "@/lib/prisma";
import { sendStreakRewardEmail } from "@/lib/email";

const TIMEZONE = "Europe/Istanbul";
const MILESTONE = 30;

function dateKey(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function daysBetweenKeys(a: string, b: string): number {
  return Math.round(
    (Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000
  );
}

// Bir soru/test çözüldüğünde çağrılır. Aynı gün içinde tekrar çağrılırsa
// (yeniden gönderim gibi) hiçbir şey değişmez — günde bir kez sayılır.
export async function recordStreakActivity(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      role: true,
      currentStreak: true,
      longestStreak: true,
      lastStreakDate: true,
      lastRewardStreak: true,
    },
  });
  if (!user) return;

  const todayKey = dateKey(new Date());
  const lastKey = user.lastStreakDate ? dateKey(user.lastStreakDate) : null;

  if (lastKey === todayKey) return;

  const newStreak =
    lastKey && daysBetweenKeys(lastKey, todayKey) === 1
      ? user.currentStreak + 1
      : 1;

  let lastRewardStreak = user.lastRewardStreak;
  const newMilestones: number[] = [];
  while (newStreak >= lastRewardStreak + MILESTONE) {
    lastRewardStreak += MILESTONE;
    newMilestones.push(lastRewardStreak);
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      currentStreak: newStreak,
      longestStreak: Math.max(user.longestStreak, newStreak),
      lastStreakDate: new Date(),
      lastRewardStreak,
    },
  });

  for (const milestone of newMilestones) {
    await prisma.streakReward.create({
      data: { userId, streakDays: milestone },
    });
    await sendStreakRewardEmail(user.name, milestone, user.role).catch(() => {
      // E-posta gönderimi başarısız olsa bile ödül kaydı admin panelinde
      // zaten görünür — akışı bozmasın.
    });
  }
}

// Streak DB'de güncel olsa bile bir gün atlanmışsa panelde 0 gösterilmeli
// (gerçek sıfırlama ancak bir sonraki aktivitede yazılır).
export function displayStreak(
  currentStreak: number,
  lastStreakDate: Date | null
): number {
  if (!lastStreakDate) return 0;
  const diff = daysBetweenKeys(dateKey(lastStreakDate), dateKey(new Date()));
  return diff <= 1 ? currentStreak : 0;
}

// Bir sonraki ödül kaç günde (30, 60, 90...) verilecek.
export function nextStreakMilestone(streak: number): number {
  return (Math.floor(streak / MILESTONE) + 1) * MILESTONE;
}
