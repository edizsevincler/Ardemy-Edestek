import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Logo } from "@/components/Logo";
import { Footer } from "@/components/Footer";
import { FreeTest } from "@/components/FreeTest";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import {
  FREE_TEST_LANGUAGES,
  makeFreeTestToken,
  pickFreeTestQuestions,
  type FreeTestSlug,
} from "@/lib/free-test";
import { getI18n } from "@/lib/i18n/server";
import { SITE_URL } from "@/lib/site";

const OG_LOCALES = { tr: "tr_TR", en: "en_GB", ru: "ru_RU" } as const;

function resolve(slug: string) {
  return slug in FREE_TEST_LANGUAGES
    ? { slug: slug as FreeTestSlug, ...FREE_TEST_LANGUAGES[slug as FreeTestSlug] }
    : null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ language: string }>;
}): Promise<Metadata> {
  const lang = resolve((await params).language);
  if (!lang) return {};
  const { locale, t } = await getI18n();
  const title = t(lang.metaTitle);
  const description = t(lang.metaDescription);
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/dene/${lang.slug}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/dene/${lang.slug}`,
      siteName: "Ardemy Academy",
      locale: OG_LOCALES[locale],
      type: "website",
    },
  };
}

export default async function FreeTestPage({
  params,
}: {
  params: Promise<{ language: string }>;
}) {
  const lang = resolve((await params).language);
  if (!lang) notFound();

  // Sorular her ziyarette rastgele seçilir; sayfa önceden üretilmemeli.
  await connection();
  const { locale, t } = await getI18n();
  const questions = await pickFreeTestQuestions(lang.name);

  const otherSlug: FreeTestSlug = lang.slug === "rusca" ? "ingilizce" : "rusca";
  const other = {
    slug: otherSlug,
    label: t(FREE_TEST_LANGUAGES[otherSlug].tryButton),
  };

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
            <Link
              href="/register"
              className="rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-3 py-1.5 text-sm font-medium text-white"
            >
              {t("Kayıt Ol")}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-4 py-8 sm:px-6">
        <div>
          <h1 className="text-2xl font-semibold text-brand-950 sm:text-3xl">
            {t(lang.h1)}
          </h1>
          <p className="mt-2 text-slate-600">{t(lang.intro)}</p>
          {locale !== "tr" && (
            <p className="mt-3 rounded-lg border border-gold-200 bg-gold-50 px-3 py-2 text-sm text-slate-700">
              {t("Not: Test soruları Türkçe konuşanlar için hazırlanmıştır; sorular ve şıklar Türkçedir.")}
            </p>
          )}
        </div>

        {questions.length === 0 ? (
          <p className="text-sm text-slate-500">
            {t("Bu test şu an hazır değil, lütfen daha sonra tekrar dene.")}
          </p>
        ) : (
          <FreeTest
            token={makeFreeTestToken(questions.map((q) => q.id))}
            questions={questions}
            otherLanguage={other}
          />
        )}

        <section className="rounded-xl border border-brand-100 bg-white p-5 text-sm text-slate-600 shadow-sm">
          <h2 className="font-medium text-brand-950">{t("Ardemy Academy nedir?")}</h2>
          <p className="mt-1">{t(lang.about)}</p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
