"use client";

import Link from "next/link";
import { useState, useSyncExternalStore, useTransition } from "react";
import { buyCardBonus } from "@/lib/cards-actions";
import { useT } from "@/lib/i18n/client";
import type { CardQuota } from "@/lib/card-quota";
import { CARD_BONUS, CARD_BONUS_PRICE, DAILY_CARD_LIMIT } from "@/lib/card-meta";

// Saniyede bir güncellenen saat (sunucuda null: geri sayım yalnızca tarayıcıda çizilir).
function subscribeClock(onChange: () => void) {
  const id = setInterval(onChange, 1000);
  return () => clearInterval(id);
}
const clockSnapshot = () => Math.floor(Date.now() / 1000);
const serverClock = () => null;

// Günlük kart sınırı dolunca gösterilir: kredi ile devam etme ve yenilenmeye kalan süre.
export function CardLimitPanel({ quota, onUnlocked }: { quota: CardQuota; onUnlocked: (quota: CardQuota) => void }) {
  const t = useT();
  const nowSec = useSyncExternalStore(subscribeClock, clockSnapshot, serverClock);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const left = nowSec === null ? null : Math.max(0, Math.floor(Date.parse(quota.resetAt) / 1000) - nowSec);
  const parts =
    left === null
      ? ["--", "--", "--"]
      : [Math.floor(left / 3600), Math.floor((left % 3600) / 60), left % 60].map((n) => String(n).padStart(2, "0"));
  const labels = [t("saat"), t("dakika"), t("saniye")];

  function unlock() {
    setError(null);
    startTransition(async () => {
      const result = await buyCardBonus();
      if (result.status === "success") onUnlocked(result.quota);
      else setError(result.message);
    });
  }

  // Yenilenme zamanı geldiyse sayfayı tazeleyip yeni günün hakkını getir.
  if (left === 0) {
    return (
      <div className="space-y-3 rounded-2xl border border-brand-100 bg-white p-6 text-center shadow-sm">
        <p className="font-semibold text-brand-950">{t("Yeni günün kelime hakkı hazır!")}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="rounded-lg bg-gradient-to-r from-gold-500 to-gold-400 px-5 py-2.5 text-sm font-semibold text-brand-950 shadow-sm active:scale-95"
        >
          {t("Kartlara devam et")}
        </button>
      </div>
    );
  }

  const canPay = quota.credits >= CARD_BONUS_PRICE;
  return (
    <div className="space-y-5 rounded-2xl border border-brand-100 bg-white p-6 text-center shadow-sm">
      <div className="space-y-2">
        <p className="text-xl font-semibold text-brand-950">{t("Bugünlük {n} kelimeyi tamamladın, harika iş!", { n: quota.used })}</p>
        <p className="text-sm text-slate-600">
          {t("Devam etmek istersen {c} kredi kullanarak {n} kelime daha açabilirsin.", { c: CARD_BONUS_PRICE, n: CARD_BONUS })}
        </p>
      </div>

      <div className="flex flex-col items-center gap-2">
        {canPay ? (
          <button
            type="button"
            onClick={unlock}
            disabled={pending}
            className="rounded-lg bg-gradient-to-r from-gold-500 to-gold-400 px-5 py-2.5 text-sm font-semibold text-brand-950 shadow-sm transition-all duration-200 hover:scale-[1.03] active:scale-95 disabled:opacity-60"
          >
            {pending ? t("Açılıyor...") : t("{c} kredi kullan ve devam et", { c: CARD_BONUS_PRICE })}
          </button>
        ) : (
          <Link
            href="/guest/credits"
            className="rounded-lg bg-gradient-to-r from-gold-500 to-gold-400 px-5 py-2.5 text-sm font-semibold text-brand-950 shadow-sm active:scale-95"
          >
            {t("Kredi al")}
          </Link>
        )}
        <p className="text-xs text-slate-500">{t("Kredin: {n}", { n: quota.credits })}</p>
        {error && <p className="text-sm text-red-600">{error}</p>}
      </div>

      <div className="space-y-2 border-t border-brand-100 pt-4">
        <p className="text-sm text-slate-600">{t("Ya da yarını bekle: ücretsiz {n} kelime hakkın 1 gün içinde yenilenecek.", { n: DAILY_CARD_LIMIT })}</p>
        <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{t("Yenilenmesine kalan süre")}</p>
        <div className="flex justify-center gap-2" role="timer" aria-live="off">
          {parts.map((value, i) => (
            <div key={i} className="w-16 rounded-xl bg-brand-50 px-2 py-2">
              <span className="block font-mono text-2xl font-semibold tabular-nums text-brand-800">{value}</span>
              <span className="block text-[11px] text-slate-500">{labels[i]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
