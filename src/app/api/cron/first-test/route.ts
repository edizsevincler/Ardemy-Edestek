import { prisma } from "@/lib/prisma";
import { sendFirstTestEmail } from "@/lib/email";
import { isLocale } from "@/lib/i18n/config";
import { claimEmail, releaseEmail } from "@/lib/reminders";

// Vercel Cron günde bir kez çağırır (bkz. vercel.json). E-postasını onaylamış,
// kaydının üzerinden en az 2 gün geçmiş ama hiçbir şey çözmemiş misafirlere
// bir kereye mahsus "ilk testini çöz" daveti gönderir.
const MIN_AGE_MS = 2 * 24 * 60 * 60 * 1000;
const MAX_AGE_MS = 21 * 24 * 60 * 60 * 1000;

export async function GET(request: Request) {
  // Gizli anahtar tanımlı değilse hiç çalışma: herkese açık bir tetikleyici olmasın.
  const secret = process.env.CRON_SECRET;
  if (!secret) return new Response("CRON_SECRET tanımlı değil", { status: 503 });
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const now = Date.now();
  const candidates = await prisma.user.findMany({
    where: {
      role: "GUEST",
      email: { not: null },
      emailVerified: { not: null },
      emailReminders: true,
      createdAt: { lte: new Date(now - MIN_AGE_MS), gte: new Date(now - MAX_AGE_MS) },
      quizSubmissions: { none: {} },
      dailyAnswers: { none: {} },
      examAttempts: { none: {} },
      unlockedQuestions: { none: {} },
      emailLogs: { none: { kind: "first-test" } },
    },
    select: { id: true, name: true, email: true, credits: true, locale: true },
  });

  let sent = 0;
  for (const user of candidates) {
    if (!user.email) continue;
    if (!(await claimEmail(user.id, "first-test"))) continue;
    try {
      await sendFirstTestEmail(
        user.id,
        user.email,
        user.name,
        user.credits,
        isLocale(user.locale) ? user.locale : "tr"
      );
      sent++;
    } catch {
      await releaseEmail(user.id, "first-test");
    }
  }

  return Response.json({ checked: candidates.length, sent });
}
