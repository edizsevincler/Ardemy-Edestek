import { getBadges } from "@/lib/badges";
import { getReferralShareUrl } from "@/lib/referral";
import { ShareButton } from "@/components/ShareButton";

export async function BadgesCard({ userId }: { userId: string }) {
  const [badges, shareUrl] = await Promise.all([
    getBadges(userId),
    getReferralShareUrl(userId),
  ]);
  const earnedCount = badges.filter((b) => b.earned).length;

  return (
    <div className="rounded-xl border border-brand-100 bg-white p-5 shadow-sm">
      <h2 className="font-medium text-brand-950">
        🏅 Rozetlerim{" "}
        <span className="text-sm font-normal text-slate-400">
          ({earnedCount}/{badges.length})
        </span>
      </h2>
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
                  text={`Ardemy Academy'de "${b.title}" rozetini kazandım! ${b.emoji} Sen de dene: ${shareUrl}`}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
