"use client";

import { useTransition } from "react";
import { approvePayment, rejectPayment } from "./actions";

export function PaymentActions({
  purchaseId,
  userName,
  credits,
}: {
  purchaseId: string;
  userName: string;
  credits: number;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex gap-3">
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          if (
            !confirm(
              `${userName} adlı kullanıcının havalesi onaylanıp ${credits} kredi hesabına eklensin mi?`
            )
          )
            return;
          startTransition(() => {
            approvePayment(purchaseId);
          });
        }}
        className="rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition hover:from-brand-500 hover:to-brand-400 disabled:opacity-50"
      >
        Onayla
      </button>
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          if (!confirm(`${userName} adlı kullanıcının talebi reddedilsin mi?`))
            return;
          startTransition(() => {
            rejectPayment(purchaseId);
          });
        }}
        className="rounded-lg border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
      >
        Reddet
      </button>
    </div>
  );
}
