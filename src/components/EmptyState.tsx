// "Henüz bir şey yok" ekranları için küçük çizimli boş durum kutusu.
// Sunucu ve istemci bileşenlerinde kullanılabilir (hook içermez).

export type EmptyIcon = "inbox" | "tasks" | "files" | "exam" | "history" | "coins" | "book";

function Art({ icon }: { icon: EmptyIcon }) {
  const common = {
    fill: "none",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
  };
  return (
    <svg viewBox="0 0 64 64" className="h-16 w-16" aria-hidden>
      {/* arka plandaki yumuşak daire */}
      <circle cx="32" cy="34" r="24" className="fill-brand-100" />
      <circle cx="49" cy="14" r="3.5" className="fill-gold-400" />
      <circle cx="12" cy="20" r="2" className="fill-brand-400" />
      <g className="stroke-brand-600" {...common}>
        {icon === "inbox" && (
          <>
            <rect x="14" y="22" width="36" height="24" rx="4" className="fill-white" />
            <path d="m16 25 16 12 16-12" />
          </>
        )}
        {icon === "tasks" && (
          <>
            <rect x="17" y="16" width="30" height="34" rx="4" className="fill-white" />
            <path d="M25 14v5h14v-5M24 31l3 3 6-7M24 42h16" />
          </>
        )}
        {icon === "files" && (
          <>
            <path d="M14 22a3 3 0 0 1 3-3h10l4 5h16a3 3 0 0 1 3 3v17a3 3 0 0 1-3 3H17a3 3 0 0 1-3-3V22Z" className="fill-white" />
            <path d="M14 29h36" />
          </>
        )}
        {icon === "exam" && (
          <>
            <rect x="16" y="14" width="26" height="36" rx="3" className="fill-white" />
            <path d="M22 24h14M22 31h14M22 38h8" />
            <path d="m38 46 12-12 4 4-12 12-5 1 1-5Z" className="fill-gold-300" />
          </>
        )}
        {icon === "history" && (
          <>
            <circle cx="32" cy="33" r="15" className="fill-white" />
            <path d="M32 24v10l6 4" />
          </>
        )}
        {icon === "coins" && (
          <>
            <ellipse cx="32" cy="24" rx="13" ry="6" className="fill-gold-300" />
            <path d="M19 24v8c0 3.3 5.8 6 13 6s13-2.7 13-6v-8M19 32v8c0 3.3 5.8 6 13 6s13-2.7 13-6v-8" className="fill-white" />
          </>
        )}
        {icon === "book" && (
          <>
            <path d="M14 18a2 2 0 0 1 2-2h14v32H16a2 2 0 0 0-2 2V18ZM50 18a2 2 0 0 0-2-2H34v32h14a2 2 0 0 1 2 2V18Z" className="fill-white" />
            <path d="M20 24h6M20 30h6M38 24h6M38 30h6" />
          </>
        )}
      </g>
    </svg>
  );
}

export function EmptyState({
  icon,
  text,
  compact = false,
}: {
  icon: EmptyIcon;
  text: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-2 text-center ${
        compact ? "py-4" : "rounded-xl border border-dashed border-brand-200 bg-white/60 px-4 py-8"
      }`}
    >
      <div className="animate-float-slow">
        <Art icon={icon} />
      </div>
      <p className="text-sm text-slate-500">{text}</p>
    </div>
  );
}
