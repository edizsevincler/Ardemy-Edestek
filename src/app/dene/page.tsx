import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Footer } from "@/components/Footer";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { FREE_TEST_LANGUAGES, FREE_TEST_SIZE } from "@/lib/free-test";
import { getT } from "@/lib/i18n/server";
import { SITE_URL } from "@/lib/site";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT();
  return {
    title: t("Ücretsiz Dil Testleri — Rusça ve İngilizce | Ardemy Academy"),
    description: t("Kayıt olmadan ücretsiz Rusça ve İngilizce testleri çöz, seviyeni anında gör."),
    alternates: { canonical: `${SITE_URL}/dene` },
  };
}

export default async function FreeTestsIndexPage() {
  const t = await getT();
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo size={32} />
            <span className="font-semibold text-brand-950">Ardemy Academy</span>
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link href="/login" className="text-sm text-brand-600 hover:underline">
              {t("Giriş Yap")}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-4 py-10 sm:px-6">
        <div>
          <h1 className="text-2xl font-semibold text-brand-950 sm:text-3xl">
            {t("Ücretsiz Dil Testleri")}
          </h1>
          <p className="mt-2 text-slate-600">
            {t("Kayıt olmadan {n} soruluk testi çöz, seviyeni anında gör.", { n: FREE_TEST_SIZE })}
          </p>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Object.entries(FREE_TEST_LANGUAGES).map(([slug, lang]) => (
            <Link
              key={slug}
              href={`/dene/${slug}`}
              className="rounded-xl border border-brand-100 bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
            >
              <p className="text-lg font-semibold text-brand-950">{t(lang.cardTitle)}</p>
              <p className="mt-1 text-sm text-slate-500">{t(lang.sample)}</p>
              <p className="mt-3 text-sm font-medium text-brand-600">
                {t("Hemen başla →")}
              </p>
            </Link>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}
