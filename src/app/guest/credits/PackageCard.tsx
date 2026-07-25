"use client";

import { useActionState } from "react";
import { requestCreditPurchase } from "./actions";

const initialState = { status: "idle" } as const;

export function PackageCard({
  id,
  name,
  credits,
  priceTRY,
}: {
  id: string;
  name: string;
  credits: number;
  priceTRY: number;
}) {
  const [state, formAction, isPending] = useActionState(
    requestCreditPurchase,
    initialState
  );

  return (
    <div className="flex flex-col justify-between rounded-xl border border-brand-100 bg-white transition-shadow duration-200 hover:shadow-md p-6 text-center shadow-sm">
      <div>
        <p className="text-sm font-medium text-brand-600">{name}</p>
        <p className="mt-2 text-3xl font-semibold text-brand-950">
          {credits}
          <span className="ml-1 text-base font-normal text-slate-500">
            kredi
          </span>
        </p>
        <p className="mt-1 text-lg font-medium text-slate-700">
          {priceTRY.toLocaleString("tr-TR", {
            style: "currency",
            currency: "TRY",
          })}
        </p>
      </div>

      <form action={formAction} className="mt-4">
        <input type="hidden" name="packageId" value={id} />
        <button
          type="submit"
          disabled={isPending || state.status === "success"}
          className="w-full rounded-lg bg-gradient-to-r from-gold-500 to-gold-400 py-2.5 text-sm font-semibold text-brand-950 shadow-sm shadow-gold-600/30 transition-all duration-200 hover:from-gold-400 hover:to-gold-300 hover:scale-[1.03] hover:shadow-lg active:scale-95 disabled:opacity-60"
        >
          {isPending
            ? "Gönderiliyor..."
            : state.status === "success"
              ? "Onay Bekliyor ✓"
              : "Havaleyi Gönderdim"}
        </button>
        {state.status === "error" && (
          <p className="mt-2 text-sm text-red-600">{state.message}</p>
        )}
        {state.status === "success" && (
          <p className="mt-2 text-xs text-slate-500">
            Talebiniz alındı. Onaylandığında kredi hesabınıza otomatik
            eklenecek.
          </p>
        )}
      </form>
    </div>
  );
}
