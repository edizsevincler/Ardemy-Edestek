import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { INSTAGRAM_HANDLE } from "@/lib/site";
import { SIGNUP_BONUS_CREDITS } from "@/lib/credits";

export const metadata: Metadata = {
  title: "Ardemy Academy — Bağlantılar",
  description: "Ücretsiz Rusça ve İngilizce testleri, kayıt ve iletişim bağlantıları.",
  // Instagram/TikTok biyografi sayfası: arama sonuçlarında çıkması gerekmiyor.
  robots: { index: false, follow: true },
};

const WHATSAPP_DIGITS = process.env.WHATSAPP_NUMBER?.replace(/[^0-9]/g, "");
const WHATSAPP_LINK = WHATSAPP_DIGITS
  ? `https://wa.me/${WHATSAPP_DIGITS}?text=${encodeURIComponent(
      "Merhaba, Ardemy Academy hakkında bilgi almak istiyorum."
    )}`
  : null;

const INSTAGRAM_URL = `https://www.instagram.com/${INSTAGRAM_HANDLE.replace("@", "")}/`;

type Item = {
  href: string;
  emoji: string;
  title: string;
  hint?: string;
  external?: boolean;
  primary?: boolean;
};

export default function LinkPage() {
  const items: Item[] = [
    {
      href: "/dene/rusca",
      emoji: "🇷🇺",
      title: "Ücretsiz Rusça testi",
      hint: "5 soru, kayıt gerekmez",
      primary: true,
    },
    {
      href: "/dene/ingilizce",
      emoji: "🇬🇧",
      title: "Ücretsiz İngilizce testi",
      hint: "5 soru, kayıt gerekmez",
      primary: true,
    },
    {
      href: "/register",
      emoji: "🎁",
      title: "Kayıt ol",
      hint: `${SIGNUP_BONUS_CREDITS} kredi hediye`,
    },
    {
      href: "/rusca-alfabe",
      emoji: "🔤",
      title: "Rusça alfabe",
      hint: "Ücretsiz poster ve okunuşlar",
    },
    ...(WHATSAPP_LINK
      ? [
          {
            href: WHATSAPP_LINK,
            emoji: "💬",
            title: "WhatsApp'tan yaz",
            hint: "Ders ve fiyat bilgisi",
            external: true,
          },
        ]
      : []),
    {
      href: INSTAGRAM_URL,
      emoji: "📸",
      title: `Instagram ${INSTAGRAM_HANDLE}`,
      hint: "Her gün yeni soru",
      external: true,
    },
  ];

  return (
    <main className="relative flex min-h-screen justify-center overflow-hidden bg-gradient-to-br from-brand-950 via-brand-800 to-brand-600 px-4 py-10">
      <div className="pointer-events-none absolute -top-32 -left-32 h-80 w-80 rounded-full bg-gold-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-brand-400/30 blur-3xl" />

      <div className="relative w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <Logo size={72} />
          <h1 className="mt-4 text-xl font-semibold text-white">Ardemy Academy</h1>
          <p className="mt-1 text-sm text-brand-100">
            Rusça &amp; İngilizce · Ediz Sevinçler
          </p>
        </div>

        <ul className="mt-8 space-y-3">
          {items.map((item) => {
            const className = `flex items-center gap-3 rounded-xl px-4 py-3 shadow-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
              item.primary
                ? "bg-gradient-to-r from-gold-500 to-gold-400 text-brand-950"
                : "bg-white/95 text-brand-950"
            }`;
            const content = (
              <>
                <span className="text-2xl">{item.emoji}</span>
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold">{item.title}</span>
                  {item.hint && (
                    <span className="block truncate text-xs text-slate-600">
                      {item.hint}
                    </span>
                  )}
                </span>
              </>
            );
            return (
              <li key={item.href}>
                {item.external ? (
                  <a href={item.href} target="_blank" rel="noopener noreferrer" className={className}>
                    {content}
                  </a>
                ) : (
                  <Link href={item.href} className={className}>
                    {content}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
}
