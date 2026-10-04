"use client";

import { useT } from "@/lib/i18n/client";
import { Celebration } from "@/components/Celebration";
import { ShareButton } from "@/components/ShareButton";

export function NewBadgesBanner({
  badges,
  notes = [],
  shareUrl,
}: {
  badges: { id: string; emoji: string; title: string }[];
  notes?: string[];
  // Verilirse her yeni rozetin altında "Paylaş" düğmesi çıkar (arkadaş linkiyle).
  shareUrl?: string;
}) {
  const t = useT();
  if (badges.length === 0 && notes.length === 0) return null;
  return (
    <div className="rounded-xl border border-gold-300 bg-gradient-to-r from-gold-50 to-white p-4 text-center shadow-sm animate-pop">
      {badges.length > 0 && <Celebration />}
      {badges.length > 0 && (
        <>
          <p className="text-sm font-semibold text-brand-950">
            {badges.length > 1 ? t("🎉 Yeni rozetler kazandın!") : t("🎉 Yeni rozet kazandın!")}
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
            {badges.map((b, i) => (
              <div
                key={b.id}
                style={{ animationDelay: `${0.25 + i * 0.15}s` }}
                className="animate-badge-in flex flex-col items-center gap-1.5"
              >
                <span className="rounded-full border border-gold-200 bg-white px-3 py-1 text-sm font-medium text-brand-950">
                  {b.emoji} {b.title}
                </span>
                {shareUrl && (
                  <ShareButton
                    small
                    imagePath={`/api/share/badge/${b.id}`}
                    filename={`ardemy-rozet-${b.id}.png`}
                    text={t("Ardemy Academy'de \"{title}\" rozetini kazandım! {emoji} Sen de dene: {url}", { title: b.title, emoji: b.emoji, url: shareUrl })}
                  />
                )}
              </div>
            ))}
          </div>
        </>
      )}
      {notes.map((n) => (
        <p
          key={n}
          className={`text-sm font-medium text-sky-800 ${
            badges.length > 0 ? "mt-2" : "first:mt-0 mt-1"
          }`}
        >
          {n}
        </p>
      ))}
    </div>
  );
}
