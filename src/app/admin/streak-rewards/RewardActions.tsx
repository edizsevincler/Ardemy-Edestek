"use client";

import { useTransition } from "react";
import { markRewardFulfilled } from "./actions";

export function RewardActions({
  rewardId,
  userName,
}: {
  rewardId: string;
  userName: string;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => {
        if (!confirm(`${userName} adlı kullanıcının ödülü verildi mi?`)) return;
        startTransition(() => {
          markRewardFulfilled(rewardId);
        });
      }}
      className="rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:from-brand-500 hover:to-brand-400 hover:scale-[1.03] hover:shadow-lg active:scale-95 disabled:opacity-50"
    >
      Verildi
    </button>
  );
}
