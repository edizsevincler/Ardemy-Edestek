import { prisma } from "@/lib/prisma";
import { dateKey, displayStreak } from "@/lib/streak";
import { sendStreakReminderEmail } from "@/lib/email";

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
    },
    select: {
      id: true,
      name: true,
      email: true,
      currentStreak: true,
      lastStreakDate: true,
      streakFreezes: true,
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

    try {
      await sendStreakReminderEmail(user.email, user.name, user.currentStreak);
      sent++;
    } catch {
      // Bir kullanıcıya gönderim başarısız olsa bile diğerlerini engellemesin.
    }
  }

  return Response.json({ checked: candidates.length, sent });
}
