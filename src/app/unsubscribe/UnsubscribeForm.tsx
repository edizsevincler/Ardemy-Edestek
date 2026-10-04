"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { confirmUnsubscribe } from "./actions";
import { useT } from "@/lib/i18n/client";

export function UnsubscribeForm({ userId, token }: { userId: string; token: string }) {
  const t = useT();
  const [status, setStatus] = useState<"idle" | "done" | "error">("idle");
  const [isPending, startTransition] = useTransition();

  function submit(formData: FormData) {
    startTransition(async () => {
      const result = await confirmUnsubscribe(formData);
      setStatus(result.ok ? "done" : "error");
    });
  }

  if (status === "done") {
    return (
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          {t("Hatırlatma e-postaları kapatıldı. Şifre sıfırlama gibi hesabınla ilgili önemli e-postalar yine gelir.")}
        </p>
        <Link href="/login" className="inline-block text-sm font-medium text-brand-600 hover:underline">
          {t("Giriş sayfasına dön")}
        </Link>
      </div>
    );
  }

  return (
    <form action={submit} className="space-y-4">
      <input type="hidden" name="u" value={userId} />
      <input type="hidden" name="t" value={token} />
      <p className="text-sm text-slate-600">
        {t("Seri hatırlatmaları ve davet e-postalarını almayı bırakmak istiyor musun?")}
      </p>
      {status === "error" && (
        <p className="text-sm text-red-600">{t("Bu bağlantı geçersiz.")}</p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-lg bg-gradient-to-r from-gold-500 to-gold-400 py-2.5 text-sm font-semibold text-brand-950 shadow-sm transition-all duration-200 hover:scale-[1.03] active:scale-95 disabled:opacity-60"
      >
        {isPending ? t("Kaydediliyor...") : t("Evet, bu e-postaları alma")}
      </button>
    </form>
  );
}
