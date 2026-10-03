"use client";

import Link from "next/link";
import { Logo } from "@/components/Logo";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useT } from "@/lib/i18n/client";

// Giriş, kayıt, şifre sıfırlama ve e-posta onayı sayfalarının ortak kabuğu:
// geniş ekranda solda marka alanı, sağda form kartı; telefonda yalnızca kart.
export function AuthShell({ children }: { children: React.ReactNode }) {
  const t = useT();
  const points = [
    { emoji: "📅", title: t("Günün Sorusu ve seri"), text: t("Her gün yeni bir soru çöz, serini koru; hediye ödüller kazan.") },
    { emoji: "📝", title: t("Deneme sınavları"), text: t("Gerçek sınav havasında, süreli deneme sınavlarıyla seviyeni ölç.") },
    { emoji: "🏅", title: t("Rozetler ve mağaza"), text: t("Başardıkça rozet topla, kredilerinle unvan ve çerçeve al.") },
  ];

  return (
    <main className="relative flex min-h-screen flex-col overflow-hidden bg-gradient-to-br from-brand-950 via-brand-800 to-brand-600">
      <div className="pointer-events-none absolute -top-32 -left-32 h-80 w-80 rounded-full bg-gold-400/20 blur-3xl animate-float-slow" />
      <div className="pointer-events-none absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-brand-400/30 blur-3xl animate-float-slow-delayed" />

      <div className="absolute right-4 top-4 z-10 flex items-center gap-2">
        <ThemeToggle />
        <LanguageSwitcher tone="dark" />
      </div>

      <div className="relative mx-auto grid w-full max-w-5xl flex-1 items-center gap-12 px-4 py-16 lg:grid-cols-2">
        <aside className="hidden text-white lg:block">
          <div className="flex items-center gap-3">
            <Logo size={48} />
            <span className="text-lg font-semibold">Ardemy Academy</span>
          </div>
          <h2 className="mt-8 text-4xl font-semibold leading-tight">
            {t("Rusça ve İngilizce, her gün 5 dakika")}
          </h2>
          <ul className="mt-8 space-y-5">
            {points.map((p) => (
              <li key={p.title} className="flex gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-2xl">
                  {p.emoji}
                </span>
                <div>
                  <p className="font-medium">{p.title}</p>
                  <p className="text-sm text-brand-100">{p.text}</p>
                </div>
              </li>
            ))}
          </ul>
        </aside>

        <div className="flex justify-center lg:justify-end">{children}</div>
      </div>

      <div className="relative flex justify-center gap-4 pb-4 text-xs text-white/70">
        <Link href="/gizlilik-politikasi" className="hover:text-white hover:underline">
          {t("Gizlilik Politikası")}
        </Link>
        <Link href="/mesafeli-satis-sozlesmesi" className="hover:text-white hover:underline">
          {t("Mesafeli Satış Sözleşmesi")}
        </Link>
      </div>
    </main>
  );
}
