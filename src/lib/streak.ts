import { prisma } from "@/lib/prisma";
import { sendStreakRewardEmail } from "@/lib/email";
import { makeT, type TFunction } from "@/lib/i18n/translate";

const TIMEZONE = "Europe/Istanbul";
const MILESTONE = 30;

// Seri koruma: kaçırılan günü otomatik kurtarır.
export const FREEZE_PRICE_CREDITS = 1;
export const FREEZE_MAX = 3;
const FREEZE_EVERY_DAYS = 7; // her 7. seri gününde 1 bedava koruma

export function dateKey(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function daysBetweenKeys(a: string, b: string): number {
  return Math.round(
    (Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`)) / 86_400_000
  );
}

export type StreakActivityResult = {
  freezesUsed: number;
  freezeEarned: boolean;
};

// Bir soru/test çözüldüğünde çağrılır. Aynı gün içinde tekrar çağrılırsa
// (yeniden gönderim gibi) hiçbir şey değişmez — günde bir kez sayılır.
export async function recordStreakActivity(
  userId: string
): Promise<StreakActivityResult> {
  const none = { freezesUsed: 0, freezeEarned: false };

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      name: true,
      role: true,
      currentStreak: true,
      longestStreak: true,
      lastStreakDate: true,
      lastRewardStreak: true,
      streakFreezes: true,
    },
  });
  if (!user) return none;

  const todayKey = dateKey(new Date());
  const lastKey = user.lastStreakDate ? dateKey(user.lastStreakDate) : null;

  if (lastKey === todayKey) return none;

  const diff = lastKey ? daysBetweenKeys(lastKey, todayKey) : null;
  let newStreak = 1;
  let freezesUsed = 0;
  if (diff === 1) {
    newStreak = user.currentStreak + 1;
  } else if (diff !== null && diff > 1 && user.currentStreak > 0) {
    // Kaçırılan her gün için bir koruma gerekir; hepsini karşılayamıyorsa
    // seri zaten kaybedilir ve korumalar harcanmaz.
    const missedDays = diff - 1;
    if (user.streakFreezes >= missedDays) {
      newStreak = user.currentStreak + 1;
      freezesUsed = missedDays;
    }
  }

  const continued = newStreak > user.currentStreak;
  const freezesAfterUse = user.streakFreezes - freezesUsed;
  const freezeEarned =
    continued &&
    newStreak % FREEZE_EVERY_DAYS === 0 &&
    freezesAfterUse < FREEZE_MAX;

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
      streakFreezes: freezesAfterUse + (freezeEarned ? 1 : 0),
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

  return { freezesUsed, freezeEarned };
}

// Kullanıcıya gösterilecek seri koruma mesajları.
export function streakNotes(
  r: StreakActivityResult,
  t: TFunction = makeT(null)
): string[] {
  const notes: string[] = [];
  if (r.freezesUsed > 1) {
    notes.push(t("🛡️ Seri korumanız devreye girdi ({n} gün) — serin kurtuldu!", { n: r.freezesUsed }));
  } else if (r.freezesUsed === 1) {
    notes.push(t("🛡️ Seri korumanız devreye girdi — serin kurtuldu!"));
  }
  if (r.freezeEarned) {
    notes.push(t("🎁 {n} günlük seri: 1 seri koruma kazandın!", { n: FREEZE_EVERY_DAYS }));
  }
  return notes;
}

// Streak DB'de güncel olsa bile bir gün atlanmışsa panelde 0 gösterilmeli
// (gerçek sıfırlama ancak bir sonraki aktivitede yazılır). Seri koruma varsa
// kaçırılan günleri karşıladığı sürece seri hâlâ canlıdır.
export function displayStreak(
  currentStreak: number,
  lastStreakDate: Date | null,
  freezes = 0
): number {
  if (!lastStreakDate) return 0;
  const diff = daysBetweenKeys(dateKey(lastStreakDate), dateKey(new Date()));
  return diff <= 1 + freezes ? currentStreak : 0;
}

// Bir sonraki ödül kaç günde (30, 60, 90...) verilecek.
export function nextStreakMilestone(streak: number): number {
  return (Math.floor(streak / MILESTONE) + 1) * MILESTONE;
}
