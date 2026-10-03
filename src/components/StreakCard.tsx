"use client";

import { useEffect, useState } from "react";
import { useT } from "@/lib/i18n/client";

const RADIUS = 44;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

// Panelin seri kartı: ödüle (30 gün) doğru dolan bir halka, seri uzadıkça
// büyüyüp parlayan alev ve haftalık noktalar. Halka sayfa açılınca dolar.
export function StreakCard({
  streak,
  milestone,
  doneToday,
  children,
}: {
  streak: number;
  milestone: number;
  doneToday: boolean;
  children?: React.ReactNode;
}) {
  const t = useT();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setReady(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const span = 30;
  const progress = Math.min((streak % span) / span, 1);
  const daysToReward = milestone - streak;
  const alive = streak > 0;
  const tier = streak >= 14 ? 3 : streak >= 7 ? 2 : alive ? 1 : 0;
  const weekFilled = alive ? (streak % 7 === 0 ? 7 : streak % 7) : 0;

  const flameScale = [1, 1, 1.15, 1.3][tier];
  const glow = ["none", "0 0 14px rgba(251,146,60,0.45)", "0 0 22px rgba(251,146,60,0.65)", "0 0 32px rgba(251,191,36,0.85)"][tier];

  return (
    <div className="rounded-2xl border border-orange-200 bg-gradient-to-br from-orange-50 to-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-5">
        <div
          className="relative h-28 w-28 shrink-0 rounded-full"
          style={{ boxShadow: ready ? glow : "none", transition: "box-shadow 0.8s ease" }}
        >
          <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90" aria-hidden>
            <circle cx="50" cy="50" r={RADIUS} fill="none" strokeWidth="8" className="stroke-orange-200" />
            <circle
              cx="50"
              cy="50"
              r={RADIUS}
              fill="none"
              strokeWidth="8"
              strokeLinecap="round"
              stroke="#f97316"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={ready ? CIRCUMFERENCE * (1 - progress) : CIRCUMFERENCE}
              style={{ transition: "stroke-dashoffset 1.1s cubic-bezier(0.22, 1, 0.36, 1)" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span
              className={`text-4xl leading-none ${alive ? "animate-flicker" : "opacity-40 grayscale"}`}
              style={{ transform: `scale(${flameScale})`, display: "inline-block" }}
              aria-hidden
            >
              🔥
            </span>
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm text-slate-500">{t("🔥 Çalışma seriniz")}</p>
          <p className="text-3xl font-semibold text-brand-950">{t("{n} gün", { n: streak })}</p>
          <p className="mt-1 text-xs text-slate-500">
            {t("{n} gün sonra 40 dk hediye ders!", { n: daysToReward })}
          </p>

          <div className="mt-3 flex items-center gap-1.5" aria-hidden>
            {Array.from({ length: 7 }, (_, i) => (
              <span
                key={i}
                className={`h-2.5 w-6 rounded-full transition-colors duration-500 ${
                  i < weekFilled && ready ? "bg-orange-500" : "bg-orange-200"
                }`}
                style={{ transitionDelay: `${i * 70}ms` }}
              />
            ))}
          </div>

          <p
            className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-medium ${
              doneToday
                ? "bg-green-50 text-green-700"
                : "bg-gold-50 text-gold-600"
            }`}
          >
            {doneToday
              ? t("✓ Bugün tamamlandı")
              : t("Serin sürsün: bugünkü soruyu çöz")}
          </p>
          {children && <div className="mt-3">{children}</div>}
        </div>
      </div>
    </div>
  );
}
