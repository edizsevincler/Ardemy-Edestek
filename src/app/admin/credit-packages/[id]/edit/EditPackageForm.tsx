"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { editCreditPackage } from "../../actions";

const initialState = { status: "idle" } as const;

export function EditPackageForm({
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
    editCreditPackage,
    initialState
  );
  const router = useRouter();

  useEffect(() => {
    if (state.status === "success") {
      router.push("/admin/credit-packages");
    }
  }, [state, router]);

  return (
    <form
      action={formAction}
      className="space-y-4 rounded-xl border border-brand-100 bg-white p-5 shadow-sm"
    >
      <input type="hidden" name="id" value={id} />

      <div>
        <label className="text-sm font-medium text-slate-700">
          Paket adı
        </label>
        <input
          name="name"
          type="text"
          required
          defaultValue={name}
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
            defaultValue={credits}
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
            defaultValue={priceTRY}
            required
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-brand-900/20 transition hover:from-brand-500 hover:to-brand-400 disabled:opacity-60"
        >
          {isPending ? "Kaydediliyor..." : "Kaydet"}
        </button>
        {state.status === "error" && (
          <p className="text-sm text-red-600">{state.message}</p>
        )}
      </div>
    </form>
  );
}
