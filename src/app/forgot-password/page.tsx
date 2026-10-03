"use client";

import { useActionState } from "react";
import Link from "next/link";
import { requestPasswordReset } from "./actions";
import { Logo } from "@/components/Logo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useT } from "@/lib/i18n/client";

const initialState = { status: "idle" } as const;

export default function ForgotPasswordPage() {
  const t = useT();
  const [state, formAction, isPending] = useActionState(
    requestPasswordReset,
    initialState
  );

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-brand-950 via-brand-800 to-brand-600 px-4 py-10">
      <div className="pointer-events-none absolute -top-32 -left-32 h-80 w-80 rounded-full bg-gold-400/20 blur-3xl animate-float-slow" />
      <div className="pointer-events-none absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-brand-400/30 blur-3xl animate-float-slow-delayed" />
      <div className="absolute right-4 top-4">
        <LanguageSwitcher tone="dark" />
      </div>

      {state.status === "success" ? (
        <div className="relative w-full max-w-sm space-y-4 rounded-2xl bg-white p-8 text-center shadow-2xl ring-1 ring-black/5">
          <Logo size={64} />
          <h1 className="text-xl font-semibold text-brand-950">
            {t("E-postanızı kontrol edin")}
          </h1>
          <p className="text-sm text-slate-500">
            {t("Bu e-posta adresiyle kayıtlı bir hesap varsa şifre sıfırlama linki gönderdik. Linki bulamıyorsanız gereksiz/spam klasörünü kontrol edin.")}
          </p>
          <Link
            href="/login"
            className="inline-block text-sm font-medium text-brand-600 hover:underline"
          >
            {t("Giriş sayfasına dön")}
          </Link>
        </div>
      ) : (
        <form
          action={formAction}
          className="relative w-full max-w-sm space-y-5 rounded-2xl bg-white p-8 shadow-2xl ring-1 ring-black/5"
        >
          <div className="flex flex-col items-center text-center">
            <Logo size={64} />
            <h1 className="mt-4 text-xl font-semibold text-brand-950">
              {t("Şifremi Unuttum")}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {t("E-posta adresinizi girin, size şifre sıfırlama linki gönderelim.")}
            </p>
          </div>

          <div className="space-y-1">
            <label htmlFor="email" className="text-sm font-medium text-slate-700">
              {t("E-posta")}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
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
            {isPending ? t("Gönderiliyor...") : t("Sıfırlama Linki Gönder")}
          </button>

          <p className="text-center text-xs text-slate-400">
            {t("E-posta adresiniz kayıtlı değilse (ör. eğitmeninizin oluşturduğu öğrenci hesabı) şifre sıfırlamasını eğitmeninizden isteyin.")}
          </p>
          <p className="text-center text-sm text-slate-500">
            <Link href="/login" className="font-medium text-brand-600 hover:underline">
              {t("Giriş sayfasına dön")}
            </Link>
          </p>
        </form>
      )}
    </main>
  );
}
