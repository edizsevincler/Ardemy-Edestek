import { getBadges } from "@/lib/badges";
import { getReferralShareUrl } from "@/lib/referral";
import { ShareButton } from "@/components/ShareButton";
import { getT } from "@/lib/i18n/server";
import { prisma } from "@/lib/prisma";
import { displayStreak } from "@/lib/streak";

export async function BadgesCard({ userId }: { userId: string }) {
  const t = await getT();
  const [badges, shareUrl, tests, me] = await Promise.all([
    getBadges(userId),
    getReferralShareUrl(userId),
    prisma.quizSubmission.count({ where: { userId } }),
    prisma.user.findUnique({
      where: { id: userId },
      select: { currentStreak: true, lastStreakDate: true, streakFreezes: true },
    }),
  ]);
  const earnedCount = badges.filter((b) => b.earned).length;
  const streak = me ? displayStreak(me.currentStreak, me.lastStreakDate, me.streakFreezes) : 0;
  const canShareProgress = tests > 0 || earnedCount > 0 || streak > 0;

  return (
    <div className="rounded-xl border border-brand-100 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-medium text-brand-950">
          {t("🏅 Rozetlerim")}{" "}
          <span className="text-sm font-normal text-slate-400">
            ({earnedCount}/{badges.length})
          </span>
        </h2>
        {canShareProgress && (
          <ShareButton
            small
            imagePath="/api/share/progress"
            filename="ardemy-ilerleme.png"
            label={t("İlerlememi paylaş")}
            text={t("Ardemy Academy'de {tests} test çözdüm, {badges} rozet topladım! 🚀 Sen de dene: {url}", { tests, badges: earnedCount, url: shareUrl })}
          />
        )}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {badges.map((b) => (
          <div
            key={b.id}
            className={`rounded-lg border p-3 text-center ${
              b.earned
                ? "border-gold-200 bg-gold-50"
                : "border-slate-200 bg-slate-50"
            }`}
          >
            <div className={`text-2xl ${b.earned ? "" : "opacity-30 grayscale"}`}>
              {b.emoji}
            </div>
            <p
              className={`mt-1 text-sm font-medium ${
                b.earned ? "text-brand-950" : "text-slate-400"
              }`}
            >
              {b.title}
            </p>
            <p className="text-xs text-slate-400">
              {b.earned
                ? b.description
                : `${b.description} (${Math.min(b.current, b.target)}/${b.target})`}
            </p>
            {b.earned && (
              <div className="mt-2">
                <ShareButton
                  small
                  imagePath={`/api/share/badge/${b.id}`}
                  filename={`ardemy-rozet-${b.id}.png`}
                  text={t("Ardemy Academy'de \"{title}\" rozetini kazandım! {emoji} Sen de dene: {url}", { title: b.title, emoji: b.emoji, url: shareUrl })}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
