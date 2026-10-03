import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Footer } from "@/components/Footer";
import { FREE_TEST_LANGUAGES, FREE_TEST_SIZE } from "@/lib/free-test";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Ücretsiz Dil Testleri — Rusça ve İngilizce | Ardemy Academy",
  description:
    "Kayıt olmadan ücretsiz Rusça ve İngilizce testleri çöz, seviyeni anında gör.",
  alternates: { canonical: `${SITE_URL}/dene` },
};

export default function FreeTestsIndexPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo size={32} />
            <span className="font-semibold text-brand-950">Ardemy Academy</span>
          </Link>
          <Link href="/login" className="text-sm text-brand-600 hover:underline">
            Giriş Yap
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-4 py-10 sm:px-6">
        <div>
          <h1 className="text-2xl font-semibold text-brand-950 sm:text-3xl">
            Ücretsiz Dil Testleri
          </h1>
          <p className="mt-2 text-slate-600">
            Kayıt olmadan {FREE_TEST_SIZE} soruluk testi çöz, seviyeni anında
            gör.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Object.entries(FREE_TEST_LANGUAGES).map(([slug, lang]) => (
            <Link
              key={slug}
              href={`/dene/${slug}`}
              className="rounded-xl border border-brand-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <p className="text-lg font-semibold text-brand-950">
                {lang.name} Testi
              </p>
              <p className="mt-1 text-sm text-slate-500">{lang.sample}</p>
              <p className="mt-3 text-sm font-medium text-brand-600">
                Hemen başla →
              </p>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
