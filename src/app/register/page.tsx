"use client";

import { Suspense, useActionState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { registerGuest } from "./actions";
import { Logo } from "@/components/Logo";
import { AuthShell } from "@/components/AuthShell";
import { useT } from "@/lib/i18n/client";
import { SIGNUP_BONUS_CREDITS } from "@/lib/credits";

const initialState = { status: "idle" } as const;

function RegisterForm() {
  const t = useT();
  const [state, formAction, isPending] = useActionState(
    registerGuest,
    initialState
  );
  const ref = useSearchParams().get("ref");

  if (state.status === "success") {
    return (
      <AuthShell>
        <div className="relative w-full max-w-sm space-y-4 rounded-2xl bg-white p-8 text-center shadow-2xl ring-1 ring-black/5">
          <Logo size={64} />
          <h1 className="text-xl font-semibold text-brand-950">
            {t("E-postanızı kontrol edin")}
          </h1>
          <p className="text-sm text-slate-500">
            {t("Hesabınızı aktifleştirmek için e-postanıza gönderilen linke tıklayın. Linki bulamıyorsanız gereksiz/spam klasörünü kontrol edin.")}
          </p>
          <Link
            href="/login"
            className="inline-block text-sm font-medium text-brand-600 hover:underline"
          >
            {t("Giriş sayfasına dön")}
          </Link>
        </div>
      </AuthShell>
    );
  }

  return (
    <AuthShell>

      <form
        action={formAction}
        className="relative w-full max-w-sm space-y-5 rounded-2xl bg-white p-8 shadow-2xl ring-1 ring-black/5"
      >
        <div className="flex flex-col items-center text-center">
          <Logo size={64} />
          <h1 className="mt-4 text-xl font-semibold text-brand-950">
            {t("Hesap Oluştur")}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {t("Soru bankasına erişmek için kayıt olun")}
          </p>
          <p className="mt-2 rounded-full bg-gold-50 px-3 py-1 text-xs font-medium text-gold-600">
            {t("🎁 Kayıt olunca {n} kredi hediye!", { n: SIGNUP_BONUS_CREDITS })}
          </p>
        </div>

        {ref && <input type="hidden" name="ref" value={ref} />}

        <div className="space-y-1">
          <label htmlFor="name" className="text-sm font-medium text-slate-700">
            {t("Ad Soyad")}
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
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

        <div className="space-y-1">
          <label htmlFor="password" className="text-sm font-medium text-slate-700">
            {t("Şifre")}
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
          <label
            htmlFor="passwordConfirm"
            className="text-sm font-medium text-slate-700"
          >
            {t("Şifre (tekrar)")}
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

        <label className="flex items-start gap-2 text-xs text-slate-500">
          <input
            type="checkbox"
            name="consent"
            required
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300"
          />
          <span>
            <Link
              href="/gizlilik-politikasi"
              target="_blank"
              className="font-medium text-brand-600 hover:underline"
            >
              {t("Gizlilik Politikası ve KVKK Aydınlatma Metni")}
            </Link>
            {t("'ni okudum, kabul ediyorum.")}
          </span>
        </label>

        {state.status === "error" && (
          <p className="text-sm text-red-600">{state.message}</p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-gradient-to-r from-gold-500 to-gold-400 py-2.5 text-sm font-semibold text-brand-950 shadow-sm shadow-gold-600/30 transition-all duration-200 hover:from-gold-400 hover:to-gold-300 hover:scale-[1.03] hover:shadow-lg active:scale-95 disabled:opacity-60"
        >
          {isPending ? t("Oluşturuluyor...") : t("Kayıt Ol")}
        </button>

        <p className="text-center text-sm text-slate-500">
          {t("Zaten hesabınız var mı?")}{" "}
          <Link href="/login" className="font-medium text-brand-600 hover:underline">
            {t("Giriş yapın")}
          </Link>
        </p>
      </form>
    </AuthShell>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={null}>
      <RegisterForm />
    </Suspense>
  );
}
