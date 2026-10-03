export function NewBadgesBanner({
  badges,
  notes = [],
}: {
  badges: { emoji: string; title: string }[];
  notes?: string[];
}) {
  if (badges.length === 0 && notes.length === 0) return null;
  return (
    <div className="rounded-xl border border-gold-300 bg-gradient-to-r from-gold-50 to-white p-4 text-center shadow-sm">
      {badges.length > 0 && (
        <>
          <p className="text-sm font-semibold text-brand-950">
            🎉 Yeni rozet{badges.length > 1 ? "ler" : ""} kazandın!
          </p>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
            {badges.map((b) => (
              <span
                key={b.title}
                className="rounded-full border border-gold-200 bg-white px-3 py-1 text-sm font-medium text-brand-950"
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
