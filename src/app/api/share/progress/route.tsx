import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getBadges } from "@/lib/badges";
import { displayStreak } from "@/lib/streak";
import { ProgressCard } from "@/lib/og/cards";
import { parseFormat } from "@/lib/og/assets";
import { ogResponse } from "@/lib/og/respond";
import { getT } from "@/lib/i18n/server";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });
  const userId = session.user.id;

  const [me, tests, badges] = await Promise.all([
    prisma.user.findUnique({
      where: { id: userId },
      select: { currentStreak: true, lastStreakDate: true, streakFreezes: true },
    }),
    prisma.quizSubmission.count({ where: { userId } }),
    getBadges(userId),
  ]);
  const streak = me ? displayStreak(me.currentStreak, me.lastStreakDate, me.streakFreezes) : 0;
  const earned = badges.filter((b) => b.earned).length;
  // Paylaşacak bir şey yoksa kart üretilmez.
  if (tests === 0 && earned === 0 && streak === 0) {
    return new Response("Not found", { status: 404 });
  }

  const url = new URL(request.url);
  const format = parseFormat(url.searchParams.get("format"));
  const firstName = (session.user.name ?? "").split(" ")[0];
  const t = await getT();

  return ogResponse(
    ({ size, logo }) => (
      <ProgressCard
        size={size}
        logo={logo}
        firstName={firstName}
        tests={tests}
        badges={earned}
        streak={streak}
        t={t}
      />
    ),
    format,
    "ardemy-ilerleme.png",
    url.searchParams.get("download") === "1"
  );
}
