"use client";

import { useState, useTransition } from "react";
import { buyStreakFreeze } from "@/lib/streak-freeze-actions";

export function StreakFreezeCard({
  freezes,
  max,
  price,
  credits,
}: {
  freezes: number;
  max: number;
  price: number;
  credits: number;
}) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const full = freezes >= max;
  const cantAfford = credits < price;

  function buy() {
    setError(null);
    startTransition(async () => {
      const res = await buyStreakFreeze();
      if (res.status === "error") setError(res.message);
    });
  }

  return (
    <div className="rounded-xl border border-sky-200 bg-sky-50/70 p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-medium text-brand-950">🛡️ Seri Korumam</h2>
        <span className="text-sm font-medium text-sky-700">
          {freezes}/{max}
        </span>
      </div>
      <p className="mt-1 text-sm text-slate-600">
        Bir gün çalışamazsan serin bozulmaz — koruma otomatik devreye girer.
        Her 7 günlük seride 1 koruma hediye kazanırsın.
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={buy}
          disabled={isPending || full || cantAfford}
          className="rounded-lg bg-gradient-to-r from-sky-600 to-sky-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:scale-[1.03] active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
        >
          {isPending ? "Alınıyor..." : `${price} kredi ile koruma al`}
        </button>
        {full && (
          <span className="text-xs text-slate-500">Maksimuma ulaştın.</span>
        )}
        {!full && cantAfford && (
          <span className="text-xs text-slate-500">Yeterli kredin yok.</span>
        )}
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
