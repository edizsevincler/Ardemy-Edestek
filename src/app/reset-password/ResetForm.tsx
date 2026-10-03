"use client";

import { useActionState } from "react";
import Link from "next/link";
import { resetPassword } from "./actions";
import { Logo } from "@/components/Logo";
import { useT } from "@/lib/i18n/client";

const initialState = { status: "idle" } as const;

export function ResetForm({ token }: { token: string }) {
  const t = useT();
  const [state, formAction, isPending] = useActionState(
    resetPassword,
    initialState
  );

  if (state.status === "success") {
    return (
      <div className="relative w-full max-w-sm space-y-4 rounded-2xl bg-white p-8 text-center shadow-2xl ring-1 ring-black/5">
        <Logo size={64} />
        <h1 className="text-xl font-semibold text-brand-950">
          {t("Şifreniz güncellendi")}
        </h1>
        <p className="text-sm text-slate-500">
          {t("Artık yeni şifrenizle giriş yapabilirsiniz.")}
        </p>
        <Link
          href="/login"
          className="inline-block rounded-lg bg-gradient-to-r from-gold-500 to-gold-400 px-5 py-2 text-sm font-semibold text-brand-950"
        >
          {t("Giriş Yap")}
        </Link>
      </div>
    );
  }

  return (
    <form
      action={formAction}
      className="relative w-full max-w-sm space-y-5 rounded-2xl bg-white p-8 shadow-2xl ring-1 ring-black/5"
    >
      <div className="flex flex-col items-center text-center">
        <Logo size={64} />
        <h1 className="mt-4 text-xl font-semibold text-brand-950">
          {t("Yeni Şifre Belirle")}
        </h1>
      </div>
      <input type="hidden" name="token" value={token} />

      <div className="space-y-1">
        <label htmlFor="password" className="text-sm font-medium text-slate-700">
          {t("Yeni şifre")}
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="new-password"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
      </div>
      <div className="space-y-1">
        <label htmlFor="passwordConfirm" className="text-sm font-medium text-slate-700">
          {t("Yeni şifre (tekrar)")}
        </label>
        <input
          id="passwordConfirm"
          name="passwordConfirm"
          type="password"
          required
          autoComplete="new-password"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
        />
      </div>

      {state.status === "error" && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-gradient-to-r from-gold-500 to-gold-400 py-2.5 text-sm font-semibold text-brand-950 shadow-sm shadow-gold-600/30 transition-all duration-200 hover:from-gold-400 hover:to-gold-300 hover:scale-[1.03] hover:shadow-lg active:scale-95 disabled:opacity-60"
      >
        {isPending ? t("Güncelleniyor...") : t("Şifreyi Güncelle")}
      </button>
    </form>
  );
}
