import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Footer } from "@/components/Footer";
import { RUSSIAN_ALPHABET } from "@/lib/alphabet";
import { SITE_URL } from "@/lib/site";

const TITLE = "Rusça Alfabe (Kiril): 33 Harfin Okunuşu ve Örnek Kelimeler | Ardemy Academy";
const DESCRIPTION =
  "Rusça alfabeyi 1 haftada öğren: 33 Kiril harfinin Türkçe okunuşu, örnek kelimeleri ve ipuçları. Ücretsiz poster indir, kayıt olmadan test çöz.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}/rusca-alfabe` },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: `${SITE_URL}/rusca-alfabe`,
    siteName: "Ardemy Academy",
    locale: "tr_TR",
    type: "article",
  },
};

const FAQ = [
  {
    q: "Rusça alfabede kaç harf var?",
    a: "Rusça alfabede 33 harf vardır: 10 ünlü, 21 ünsüz ve 2 işaret harfi (Ъ sert işaret, Ь yumuşak işaret).",
  },
  {
    q: "Rusça alfabe ne kadar sürede öğrenilir?",
    a: "Günde 5 harf çalışırsan alfabeyi yaklaşık 1 haftada tanırsın. Önce Latin harflerine benzeyen ve aynı okunanlarla başlamak işi kolaylaştırır.",
  },
  {
    q: "Latin alfabesine benzeyip farklı okunan harfler hangileri?",
    a: "В (v), Н (n), Р (r), С (s), У (u) ve Х (h) Latin harflerine benziyor ama farklı okunur. En çok bunlar karıştırılır.",
  },
  {
    q: "Ъ ve Ь harfleri nasıl okunur?",
    a: "İkisi de tek başına ses vermez. Ь yumuşak işaret, önündeki ünsüzü yumuşatır; Ъ sert işaret, iki sesi birbirinden ayırır.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const LOOKALIKES = RUSSIAN_ALPHABET.filter((l) =>
  ["В", "Н", "Р", "С", "У", "Х"].includes(l.upper)
);

export default function RussianAlphabetPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6 print:hidden">
        <div className="mx-auto flex max-w-4xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo size={32} />
            <span className="font-semibold text-brand-950">Ardemy Academy</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-sm text-brand-600 hover:underline">
              Giriş Yap
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-3 py-1.5 text-sm font-medium text-white"
            >
              Kayıt Ol
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl flex-1 space-y-8 px-4 py-8 sm:px-6">
        <div>
          <h1 className="text-2xl font-semibold text-brand-950 sm:text-3xl">
            Rusça Alfabe (Kiril): 33 Harfin Okunuşu
          </h1>
          <p className="mt-2 text-slate-600">
            Rusça yazı Kiril alfabesiyle yazılır. 33 harfin birçoğu Türkçeye
            yakın okunur; bazıları Latin harflerine benzediği halde farklı sesler
            verir. Aşağıda her harfin okunuşunu ve bir örnek kelimeyi bulabilirsin.
          </p>
          <div className="mt-4 flex flex-wrap gap-3 print:hidden">
            <a
              href="/api/poster/rusca-alfabe?download=1"
              className="rounded-lg bg-gradient-to-r from-gold-500 to-gold-400 px-4 py-2 text-sm font-semibold text-brand-950 shadow-sm transition-all duration-200 hover:scale-[1.03] active:scale-95"
            >
              ⬇️ Posteri indir (PNG)
            </a>
            <Link
              href="/dene/rusca"
              className="rounded-lg border border-brand-200 bg-white px-4 py-2 text-sm font-medium text-brand-700 hover:bg-brand-50"
            >
              Ücretsiz Rusça testi çöz
            </Link>
          </div>
        </div>

        <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {RUSSIAN_ALPHABET.map((l) => (
            <div
              key={l.upper}
              className="rounded-xl border border-brand-100 bg-white p-3 text-center shadow-sm"
            >
              <p className="text-3xl font-semibold text-brand-950">
                {l.upper} {l.lower}
              </p>
              <p className="mt-1 text-sm font-semibold text-gold-600">
                {l.sound === "-" ? "okunmaz" : `okunuşu: ${l.sound}`}
              </p>
              <p className="mt-1 text-sm text-slate-700">
                {l.example} <span className="text-slate-400">= {l.meaning}</span>
              </p>
              {l.note && <p className="mt-1 text-xs text-slate-500">{l.note}</p>}
            </div>
          ))}
        </section>

        <section className="space-y-3 rounded-xl border border-gold-200 bg-gold-50/60 p-5">
          <h2 className="text-lg font-semibold text-brand-950">
            Dikkat: Latin harflerine benzeyen ama farklı okunanlar
          </h2>
          <div className="flex flex-wrap gap-3">
            {LOOKALIKES.map((l) => (
              <span
                key={l.upper}
                className="rounded-lg border border-gold-200 bg-white px-3 py-1.5 text-sm"
              >
                <strong className="text-brand-950">{l.upper}</strong> = {l.sound}
              </span>
            ))}
          </div>
          <p className="text-sm text-slate-600">
            Önce bu 6 harfi ezberle; Rusça kelimelerin yarısından fazlasını
            doğru okumaya başlarsın.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-lg font-semibold text-brand-950">Okurken işine yarayacak ipuçları</h2>
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
            <li>Rusçada kelimenin bir hecesi vurguludur; vurgusuz <strong>О</strong> çoğu zaman a gibi okunur.</li>
            <li><strong>Е, Ё, Ю, Я</strong> harfleri kelime başında genelde y sesiyle başlar: ye, yo, yu, ya.</li>
            <li><strong>Ь</strong> ve <strong>Ъ</strong> ses vermez; yalnızca yanındaki sesi yumuşatır veya ayırır.</li>
            <li>Her gün 5 harf çalış: yaklaşık bir haftada alfabeyi tanırsın.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-brand-950">Sık sorulan sorular</h2>
          {FAQ.map((f) => (
            <div key={f.q} className="rounded-xl border border-brand-100 bg-white p-4 shadow-sm">
              <p className="font-medium text-brand-950">{f.q}</p>
              <p className="mt-1 text-sm text-slate-600">{f.a}</p>
            </div>
          ))}
        </section>

        <section className="rounded-xl border border-gold-300 bg-gradient-to-r from-gold-50 to-white p-5 text-center shadow-sm print:hidden">
          <p className="text-lg font-semibold text-brand-950">Şimdi kendini dene!</p>
          <p className="mt-1 text-sm text-slate-600">
            Kayıt olmadan 5 soruluk ücretsiz Rusça testi çöz ya da hesap açıp 2
            kredi hediye kazan.
          </p>
          <div className="mt-3 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              href="/dene/rusca"
              className="w-full rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-3 text-sm font-medium text-white sm:w-auto"
            >
              Ücretsiz testi çöz
            </Link>
            <Link
              href="/register"
              className="w-full rounded-lg bg-gradient-to-r from-gold-500 to-gold-400 px-6 py-3 text-sm font-semibold text-brand-950 sm:w-auto"
            >
              Ücretsiz Kayıt Ol — 2 kredi hediye
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
