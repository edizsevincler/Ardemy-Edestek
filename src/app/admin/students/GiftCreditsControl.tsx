"use client";

import { useState, useTransition } from "react";
import { giftCredits } from "./actions";

export function GiftCreditsControl({
  studentId,
  studentName,
  credits,
}: {
  studentId: string;
  studentName: string;
  credits: number;
}) {
  const [value, setValue] = useState(credits);
  const [amount, setAmount] = useState(5);
  const [isPending, startTransition] = useTransition();

  function gift() {
    if (amount <= 0) return;
    if (
      !confirm(`${studentName} adlı öğrenciye ${amount} kredi hediye edilsin mi?`)
    )
      return;

    setValue((v) => v + amount);
    startTransition(() => {
      giftCredits(studentId, amount);
    });
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-slate-700">{value} kredi</span>
      <input
        type="number"
        min={1}
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        className="w-14 rounded border border-slate-300 px-1.5 py-0.5 text-xs"
      />
      <button
        type="button"
        disabled={isPending}
        onClick={gift}
        className="rounded border border-brand-300 px-2 py-0.5 text-xs text-brand-700 hover:bg-brand-50 disabled:opacity-50"
      >
        Hediye Et
      </button>
    </div>
  );
}
