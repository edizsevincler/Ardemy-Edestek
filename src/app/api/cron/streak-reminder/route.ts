import { prisma } from "@/lib/prisma";
import { dateKey, displayStreak } from "@/lib/streak";
import { sendStreakReminderEmail } from "@/lib/email";
import { isLocale } from "@/lib/i18n/config";
import { claimEmail, releaseEmail } from "@/lib/reminders";

// Vercel Cron her gün 20:00 (Türkiye saati) civarında bu endpoint'i çağırır
// (bkz. vercel.json). Serisi olan ama bugün henüz aktivite yapmamış her
// kullanıcıya (e-postası varsa ve serisi hâlâ canlıysa) hatırlatma gönderir.
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (
    process.env.CRON_SECRET &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return new Response("Unauthorized", { status: 401 });
  }

  const todayKey = dateKey(new Date());

  const candidates = await prisma.user.findMany({
    where: {
      currentStreak: { gt: 0 },
      lastStreakDate: { not: null },
      email: { not: null },
      emailReminders: true,
    },
    select: {
      id: true,
      name: true,
      email: true,
      currentStreak: true,
      lastStreakDate: true,
      streakFreezes: true,
      locale: true,
    },
  });

  let sent = 0;
  for (const user of candidates) {
    if (!user.email || !user.lastStreakDate) continue;
    // Bugün zaten aktivite yapmışsa hatırlatmaya gerek yok.
    if (dateKey(user.lastStreakDate) === todayKey) continue;
    // Serisi zaten kopmuşsa (koruma da yetmiyorsa) hatırlatmak anlamsız.
    if (
      displayStreak(user.currentStreak, user.lastStreakDate, user.streakFreezes) === 0
    ) {
      continue;
    }

    // Aynı gün ikinci kez gitmesin (cron iki kez tetiklense bile).
    if (!(await claimEmail(user.id, "streak-risk", todayKey))) continue;

    try {
      await sendStreakReminderEmail(
        user.id,
        user.email,
        user.name,
        user.currentStreak,
        isLocale(user.locale) ? user.locale : "tr"
      );
      sent++;
    } catch {
      // Bir kullanıcıya gönderim başarısız olsa bile diğerlerini engellemesin.
      await releaseEmail(user.id, "streak-risk", todayKey);
    }
  }

  return Response.json({ checked: candidates.length, sent });
}
