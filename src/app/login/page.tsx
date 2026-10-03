"use client";

import { useActionState } from "react";
import Link from "next/link";
import { authenticate } from "./actions";
import { Logo } from "@/components/Logo";
import { AuthShell } from "@/components/AuthShell";
import { useT } from "@/lib/i18n/client";

export default function LoginPage() {
  const t = useT();
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined
  );

  return (
    <AuthShell>

      <form
        action={formAction}
        className="relative w-full max-w-sm space-y-6 rounded-2xl bg-white p-8 shadow-2xl ring-1 ring-black/5"
      >
        <div className="flex flex-col items-center text-center">
          <Logo size={72} />
          <h1 className="mt-4 text-xl font-semibold text-brand-950">
            Ardemy Academy
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {t("Öğrenci ve yönetici paneline erişim")}
          </p>
        </div>

        <div className="space-y-1">
          <label htmlFor="username" className="text-sm font-medium text-slate-700">
            {t("Kullanıcı adı veya e-posta")}
          </label>
          <input
            id="username"
            name="username"
            type="text"
            required
            autoComplete="username"
            placeholder={t("Kullanıcı adınız veya e-postanız")}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="text-sm font-medium text-slate-700">
            {t("Şifre")}
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>

        <p className="-mt-3 text-right text-xs">
          <Link href="/forgot-password" className="font-medium text-brand-600 hover:underline">
            {t("Şifremi unuttum")}
          </Link>
        </p>

        {errorMessage && (
          <p className="text-sm text-red-600">{errorMessage}</p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-gradient-to-r from-gold-500 to-gold-400 py-2.5 text-sm font-semibold text-brand-950 shadow-sm shadow-gold-600/30 transition-all duration-200 hover:from-gold-400 hover:to-gold-300 hover:scale-[1.03] hover:shadow-lg active:scale-95 disabled:opacity-60"
        >
          {isPending ? t("Giriş yapılıyor...") : t("Giriş Yap")}
        </button>

        <p className="text-center text-sm text-slate-500">
          {t("Öğrenci değil misiniz? Soru çözmek için")}{" "}
          <Link href="/register" className="font-medium text-brand-600 hover:underline">
            {t("kayıt olun")}
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}
