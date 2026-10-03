import { auth } from "@/auth";
import { getBadges } from "@/lib/badges";
import { BadgeCard } from "@/lib/og/cards";
import { parseFormat } from "@/lib/og/assets";
import { ogResponse } from "@/lib/og/respond";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ badgeId: string }> }
) {
  const session = await auth();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const { badgeId } = await params;
  const badges = await getBadges(session.user.id);
  // Yalnızca gerçekten kazanılmış rozetin kartı üretilebilir.
  const badge = badges.find((b) => b.id === badgeId && b.earned);
  if (!badge) return new Response("Not found", { status: 404 });

  const url = new URL(request.url);
  const format = parseFormat(url.searchParams.get("format"));
  const firstName = (session.user.name ?? "").split(" ")[0];

  return ogResponse(
    ({ size, logo }) => (
      <BadgeCard
        size={size}
        logo={logo}
        firstName={firstName}
        emoji={badge.emoji}
        title={badge.title}
        description={badge.description}
      />
    ),
    format,
    `ardemy-rozet-${badge.id}.png`,
    url.searchParams.get("download") === "1"
  );
}
