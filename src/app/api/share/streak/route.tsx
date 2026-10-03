import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { displayStreak } from "@/lib/streak";
import { StreakCard } from "@/lib/og/cards";
import { parseFormat } from "@/lib/og/assets";
import { ogResponse } from "@/lib/og/respond";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const me = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { currentStreak: true, lastStreakDate: true, streakFreezes: true },
  });
  const streak = me
    ? displayStreak(me.currentStreak, me.lastStreakDate, me.streakFreezes)
    : 0;
  if (streak < 1) return new Response("Not found", { status: 404 });

  const url = new URL(request.url);
  const format = parseFormat(url.searchParams.get("format"));
  const firstName = (session.user.name ?? "").split(" ")[0];

  return ogResponse(
    ({ size, logo }) => (
      <StreakCard size={size} logo={logo} firstName={firstName} streak={streak} />
    ),
    format,
    "ardemy-seri.png",
    url.searchParams.get("download") === "1"
  );
}
