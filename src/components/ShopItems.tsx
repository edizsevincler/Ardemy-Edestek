"use client";

import { useState, useTransition } from "react";
import { buyCosmetic, equipCosmetic } from "@/lib/cosmetics-actions";
import { FRAMES, TITLES } from "@/lib/cosmetics";
import { UserAvatar } from "@/components/UserAvatar";

type Props = {
  name: string;
  credits: number;
  owned: string[];
  equippedTitle: string | null;
  equippedFrame: string | null;
};

export function ShopItems({
  name,
  credits,
  owned,
  equippedTitle,
  equippedFrame,
}: Props) {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function run(action: () => Promise<{ status: string; message?: string }>) {
    setError(null);
    startTransition(async () => {
      const res = await action();
      if (res.status === "error") setError(res.message ?? "Bir hata oluştu.");
    });
  }

  function itemButton({
    id,
    price,
    kind,
    equipped,
  }: {
    id: string;
    price: number;
    kind: "title" | "frame";
    equipped: boolean;
  }) {
    if (owned.includes(id)) {
      return (
        <button
          type="button"
          disabled={isPending}
          onClick={() => run(() => equipCosmetic(kind, equipped ? null : id))}
          className={`mt-3 w-full rounded-lg border px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-50 ${
            equipped
              ? "border-green-300 bg-green-50 text-green-700"
              : "border-brand-200 bg-white text-brand-700 hover:bg-brand-50"
          }`}
        >
          {equipped ? "✓ Takılı (çıkar)" : "Tak"}
        </button>
      );
    }
    return (
      <button
        type="button"
        disabled={isPending || credits < price}
        onClick={() => run(() => buyCosmetic(id))}
        className="mt-3 w-full rounded-lg bg-gradient-to-r from-gold-500 to-gold-400 px-3 py-1.5 text-sm font-semibold text-brand-950 shadow-sm transition-all duration-200 hover:scale-[1.03] active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
      >
        {credits < price ? `${price} kredi (yetersiz)` : `${price} kredi ile al`}
      </button>
    );
  }

  return (
    <div className="space-y-8">
      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <section className="space-y-3">
        <h2 className="text-lg font-medium text-brand-950">🏷️ Unvanlar</h2>
        <p className="text-sm text-slate-500">
          Takılı unvan, panelin üstünde adının yanında görünür.
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {TITLES.map((t) => (
            <div
              key={t.id}
              className="rounded-xl border border-brand-100 bg-white p-4 text-center shadow-sm"
            >
              <div className="text-3xl">{t.emoji}</div>
              <p className="mt-1 font-medium text-brand-950">{t.label}</p>
              {itemButton({
                id: t.id,
                price: t.price,
                kind: "title",
                equipped: equippedTitle === t.id,
              })}
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium text-brand-950">🖼️ Profil Çerçeveleri</h2>
        <p className="text-sm text-slate-500">
          Çerçeve, panelin üstündeki profil simgenin etrafında görünür.
        </p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {FRAMES.map((f) => (
            <div
              key={f.id}
              className="rounded-xl border border-brand-100 bg-white p-4 text-center shadow-sm"
            >
              <div className="flex justify-center rounded-lg bg-brand-950 py-3">
                <UserAvatar name={name} frameId={f.id} size={44} />
              </div>
              <p className="mt-2 font-medium text-brand-950">{f.label}</p>
              {itemButton({
                id: f.id,
                price: f.price,
                kind: "frame",
                equipped: equippedFrame === f.id,
              })}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
