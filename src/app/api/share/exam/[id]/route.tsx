import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ExamCard } from "@/lib/og/cards";
import { parseFormat } from "@/lib/og/assets";
import { ogResponse } from "@/lib/og/respond";
import { getT } from "@/lib/i18n/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const { id } = await params;
  const attempt = await prisma.examAttempt.findUnique({ where: { id } });
  // Yalnızca kendi tamamlanmış sınavının kartı üretilebilir.
  if (
    !attempt ||
    attempt.userId !== session.user.id ||
    !attempt.submittedAt ||
    attempt.score === null
  ) {
    return new Response("Not found", { status: 404 });
  }

  const url = new URL(request.url);
  const format = parseFormat(url.searchParams.get("format"));
  const firstName = (session.user.name ?? "").split(" ")[0];
  const t = await getT();

  return ogResponse(
    ({ size, logo }) => (
      <ExamCard
        size={size}
        logo={logo}
        firstName={firstName}
        language={attempt.language}
        score={attempt.score ?? 0}
        total={attempt.total}
        t={t}
      />
    ),
    format,
    "ardemy-deneme-sonucu.png",
    url.searchParams.get("download") === "1"
  );
}
