import { prisma } from "@/lib/prisma";
import { dateKey } from "@/lib/streak";
import { displayStreak } from "@/lib/streak";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { makeT } from "@/lib/i18n/translate";
import { getDictionary } from "@/lib/i18n/dictionary";
import { claimEmail, releaseEmail } from "@/lib/reminders";
import { sendPushToUser, type PushPayload } from "@/lib/push";

// Türkiye saati (UTC+3, yaz saati yok) için şu anki saat.
export function istanbulHour(now = new Date()) {
  return (now.getUTCHours() + 3) % 24;
}

// Hatırlatma, seçilen saatte gönderilir; zamanlayıcı geciktiyse sonraki 2 saat
// içinde de yakalanır (günde en fazla bir kez: EmailLog "push-daily").
const CATCH_UP_HOURS = 2;

export function buildPushPayload(streak: number, locale: Locale): PushPayload {
  const t = makeT(getDictionary(locale), locale);
  return streak > 0
    ? {
        title: t("🔥 {n} günlük serin tehlikede", { n: streak }),
        body: t("Bugünün sorusunu çöz, serin sürsün."),
        url: "/",
        tag: "daily-reminder",
      }
    : {
        title: t("📅 Günün sorusu seni bekliyor"),
        body: t("Sadece 1 dakika: bugünün sorusunu çöz."),
        url: "/",
        tag: "daily-reminder",
      };
}

type Sender = (userId: string, payload: PushPayload) => Promise<boolean>;

// Bildirim saati gelmiş, bugün henüz günün sorusunu çözmemiş kullanıcılara push
// gönderir. `send` testlerde değiştirilebilir.
export async function runPushTick(options: { now?: Date; send?: Sender } = {}) {
  const now = options.now ?? new Date();
  const send = options.send ?? sendPushToUser;
  const hour = istanbulHour(now);
  const today = dateKey(now);

  // Saat penceresi gece yarısını aşabilir (ör. 23 → 0, 1).
  const hours = Array.from({ length: CATCH_UP_HOURS + 1 }, (_, i) => (hour - i + 24) % 24);

  const candidates = await prisma.user.findMany({
    where: {
      reminderHour: { in: hours },
      pushSubscriptions: { some: {} },
      // Bugün günün sorusunu çözmüşse hatırlatma gönderilmez.
      dailyAnswers: { none: { dateKey: today } },
    },
    select: {
      id: true,
      locale: true,
      currentStreak: true,
      lastStreakDate: true,
      streakFreezes: true,
    },
    take: 1000,
  });

  let sent = 0;
  for (const user of candidates) {
    if (!(await claimEmail(user.id, "push-daily", today))) continue;
    const streak = displayStreak(user.currentStreak, user.lastStreakDate, user.streakFreezes);
    const locale: Locale = isLocale(user.locale) ? user.locale : "tr";
    try {
      const delivered = await send(user.id, buildPushPayload(streak, locale));
      if (delivered) sent++;
      else await releaseEmail(user.id, "push-daily", today);
    } catch {
      await releaseEmail(user.id, "push-daily", today);
    }
  }
  return { hour, candidates: candidates.length, sent };
}
