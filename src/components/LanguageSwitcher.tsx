"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { setLocale } from "@/lib/i18n/actions";
import { LOCALES, LOCALE_LABELS, LOCALE_NAMES, type Locale } from "@/lib/i18n/config";
import { useLocale } from "@/lib/i18n/client";

// TR | EN | RU seçici. `tone`: koyu zeminli başlıklarda "dark", açıkta "light".
export function LanguageSwitcher({
  tone = "light",
  className = "",
}: {
  tone?: "light" | "dark";
  className?: string;
}) {
  const current = useLocale();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function choose(locale: Locale) {
    if (locale === current || isPending) return;
    startTransition(async () => {
      await setLocale(locale);
      router.refresh();
    });
  }

  const base =
    tone === "dark"
      ? "text-brand-200 hover:text-white"
      : "text-slate-500 hover:text-brand-700";
  const active =
    tone === "dark" ? "bg-white/20 text-white" : "bg-brand-100 text-brand-800";

  return (
    <div
      role="group"
      aria-label="Language"
      className={`inline-flex shrink-0 items-center gap-0.5 rounded-full border px-1 py-0.5 text-[11px] font-semibold ${
        tone === "dark" ? "border-white/20" : "border-slate-200 bg-white/80"
      } ${isPending ? "opacity-60" : ""} ${className}`}
    >
      {LOCALES.map((locale) => (
        <button
          key={locale}
          type="button"
          onClick={() => choose(locale)}
          title={LOCALE_NAMES[locale]}
          aria-pressed={locale === current}
          className={`rounded-full px-2 py-0.5 transition-colors ${
            locale === current ? active : base
          }`}
        >
          {LOCALE_LABELS[locale]}
        </button>
      ))}
    </div>
  );
}
