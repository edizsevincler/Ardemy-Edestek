"use client";

import { useActionState } from "react";
import Link from "next/link";
import { registerGuest } from "./actions";
import { Logo } from "@/components/Logo";

const initialState = { status: "idle" } as const;

export default function RegisterPage() {
  const [state, formAction, isPending] = useActionState(
    registerGuest,
    initialState
  );

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-brand-950 via-brand-800 to-brand-600 px-4 py-10">
      <div className="pointer-events-none absolute -top-32 -left-32 h-80 w-80 rounded-full bg-gold-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-brand-400/30 blur-3xl" />

      <form
        action={formAction}
        className="relative w-full max-w-sm space-y-5 rounded-2xl bg-white p-8 shadow-2xl ring-1 ring-black/5"
      >
        <div className="flex flex-col items-center text-center">
          <Logo size={64} />
          <h1 className="mt-4 text-xl font-semibold text-brand-950">
            Hesap Oluştur
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Soru bankasına erişmek için kayıt olun
          </p>
        </div>

        <div className="space-y-1">
          <label htmlFor="name" className="text-sm font-medium text-slate-700">
            Ad Soyad
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
            E-posta
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
            Şifre
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
            Şifre (tekrar)
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
          className="w-full rounded-lg bg-gradient-to-r from-gold-500 to-gold-400 py-2.5 text-sm font-semibold text-brand-950 shadow-sm shadow-gold-600/30 transition hover:from-gold-400 hover:to-gold-300 disabled:opacity-60"
        >
          {isPending ? "Oluşturuluyor..." : "Kayıt Ol"}
        </button>

        <p className="text-center text-sm text-slate-500">
          Zaten hesabınız var mı?{" "}
          <Link href="/login" className="font-medium text-brand-600 hover:underline">
            Giriş yapın
          </Link>
        </p>
      </form>
    </main>
  );
}
