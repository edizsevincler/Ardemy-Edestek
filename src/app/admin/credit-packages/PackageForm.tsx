"use client";

import { useActionState, useRef, useEffect } from "react";
import { createCreditPackage } from "./actions";

const initialState = { status: "idle" } as const;

export function PackageForm() {
  const [state, formAction, isPending] = useActionState(
    createCreditPackage,
    initialState
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <div className="rounded-xl border border-brand-100 bg-white p-5 shadow-sm">
      <h2 className="font-medium text-brand-950">Yeni Kredi Paketi</h2>
      <form ref={formRef} action={formAction} className="mt-3 space-y-3">
        <div>
          <label className="text-sm font-medium text-slate-700">
            Paket adı
          </label>
          <input
            name="name"
            type="text"
            required
            placeholder="Örn: 10 Kredi"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700">
              Kredi miktarı
            </label>
            <input
              name="credits"
              type="number"
              min={1}
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">
              Fiyat (TL)
            </label>
            <input
              name="priceTRY"
              type="number"
              min={1}
              step="0.01"
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-brand-900/20 transition hover:from-brand-500 hover:to-brand-400 disabled:opacity-60"
        >
          {isPending ? "Ekleniyor..." : "Paketi Ekle"}
        </button>

        {state.status === "error" && (
          <p className="text-sm text-red-600">{state.message}</p>
        )}
      </form>
    </div>
  );
}
