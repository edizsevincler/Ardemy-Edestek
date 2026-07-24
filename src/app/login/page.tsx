"use client";

import { useActionState } from "react";
import Link from "next/link";
import { authenticate } from "./actions";
import { Logo } from "@/components/Logo";

export default function LoginPage() {
  const [errorMessage, formAction, isPending] = useActionState(
    authenticate,
    undefined
  );

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-brand-950 via-brand-800 to-brand-600 px-4">
      <div className="pointer-events-none absolute -top-32 -left-32 h-80 w-80 rounded-full bg-gold-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-brand-400/30 blur-3xl" />

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
            Öğrenci ve yönetici paneline erişim
          </p>
        </div>

        <div className="space-y-1">
          <label htmlFor="username" className="text-sm font-medium text-slate-700">
            Kullanıcı adı
          </label>
          <input
            id="username"
            name="username"
            type="text"
            required
            autoComplete="username"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none transition focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="password" className="text-sm font-medium text-slate-700">
            Şifre
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

        {errorMessage && (
          <p className="text-sm text-red-600">{errorMessage}</p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="w-full rounded-lg bg-gradient-to-r from-gold-500 to-gold-400 py-2.5 text-sm font-semibold text-brand-950 shadow-sm shadow-gold-600/30 transition hover:from-gold-400 hover:to-gold-300 disabled:opacity-60"
        >
          {isPending ? "Giriş yapılıyor..." : "Giriş Yap"}
        </button>

        <p className="text-center text-sm text-slate-500">
          Öğrenci değil misiniz? Soru çözmek için{" "}
          <Link href="/register" className="font-medium text-brand-600 hover:underline">
            kayıt olun
          </Link>
        </p>
      </form>
    </main>
  );
}
