"use client";

import { useEffect, useState } from "react";
import { useT } from "@/lib/i18n/client";

const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const GAP = 2; // dilimler arası boşluk (çevre birimi)

// Deneme sonucu: doğru / yanlış / boş dağılımını gösteren halka grafik ve
// ortada 0'dan yukarı sayan puan. Sayfa açılınca yaklaşık 1,2 saniyede dolar.
export function ScoreDonut({
  correct,
  wrong,
  blank,
}: {
  correct: number;
  wrong: number;
  blank: number;
}) {
  const t = useT();
  const total = Math.max(correct + wrong + blank, 1);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const duration = reduce ? 0 : 1200;
    let frame = 0;
    let start: number | null = null;
    const tick = (now: number) => {
      if (start === null) start = now;
      const ratio = duration === 0 ? 1 : Math.min((now - start) / duration, 1);
      setProgress(1 - Math.pow(1 - ratio, 3)); // yavaşlayarak biter
      if (ratio < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const slices = [
    { value: correct, color: "#22c55e", label: t("Doğru") },
    { value: wrong, color: "#ef4444", label: t("Yanlış") },
    { value: blank, color: "#94a3b8", label: t("Boş") },
  ];

  let offset = 0;
  const arcs = slices.map((s) => {
    const length = (s.value / total) * CIRCUMFERENCE;
    const visible = Math.max(length - (s.value > 0 && slices.filter((x) => x.value > 0).length > 1 ? GAP : 0), 0);
    const arc = { ...s, dash: visible * progress, start: offset };
    offset += length;
    return arc;
  });

  return (
    <div className="flex flex-wrap items-center justify-center gap-6">
      <div className="relative h-36 w-36 shrink-0">
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90" aria-hidden>
          <circle cx="60" cy="60" r={RADIUS} fill="none" strokeWidth="12" className="stroke-slate-200" />
          {arcs.map((a) =>
            a.value > 0 ? (
              <circle
                key={a.label}
                cx="60"
                cy="60"
                r={RADIUS}
                fill="none"
                strokeWidth="12"
                stroke={a.color}
                strokeDasharray={`${a.dash} ${CIRCUMFERENCE}`}
                strokeDashoffset={-a.start}
              />
            ) : null
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-semibold tabular-nums text-brand-950">
            {Math.round(correct * progress)}
          </span>
          <span className="text-xs text-slate-500">/ {total}</span>
        </div>
      </div>

      <ul className="space-y-1.5 text-sm">
        {slices.map((s) => (
          <li key={s.label} className="flex items-center gap-2 text-slate-600">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="font-medium tabular-nums text-slate-900">{s.value}</span>
            {s.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
