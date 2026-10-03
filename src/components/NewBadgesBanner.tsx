"use client";

import { useT } from "@/lib/i18n/client";
import { Celebration } from "@/components/Celebration";

export function NewBadgesBanner({
  badges,
  notes = [],
}: {
  badges: { emoji: string; title: string }[];
  notes?: string[];
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
              <span
                key={b.title}
                style={{ animationDelay: `${0.25 + i * 0.15}s` }}
                className="animate-badge-in rounded-full border border-gold-200 bg-white px-3 py-1 text-sm font-medium text-brand-950"
              >
                {b.emoji} {b.title}
              </span>
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
