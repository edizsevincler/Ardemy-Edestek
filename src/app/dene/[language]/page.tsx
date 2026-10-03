import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Logo } from "@/components/Logo";
import { Footer } from "@/components/Footer";
import { FreeTest } from "@/components/FreeTest";
import {
  FREE_TEST_LANGUAGES,
  FREE_TEST_SIZE,
  makeFreeTestToken,
  pickFreeTestQuestions,
  type FreeTestSlug,
} from "@/lib/free-test";
import { SITE_URL } from "@/lib/site";

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
  const title = `Ücretsiz ${lang.name} Testi — ${FREE_TEST_SIZE} Soruda Seviyeni Dene | Ardemy Academy`;
  const description = `Kayıt olmadan ücretsiz ${lang.name} testi çöz: ${lang.sample}. Anında sonuç, doğru cevaplar ve binlerce soruluk soru bankasına erişim.`;
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/dene/${lang.slug}` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/dene/${lang.slug}`,
      siteName: "Ardemy Academy",
      locale: "tr_TR",
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
  const questions = await pickFreeTestQuestions(lang.name);

  const otherSlug: FreeTestSlug = lang.slug === "rusca" ? "ingilizce" : "rusca";
  const other = { slug: otherSlug, name: FREE_TEST_LANGUAGES[otherSlug].name };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
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

      <main className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-4 py-8 sm:px-6">
        <div>
          <h1 className="text-2xl font-semibold text-brand-950 sm:text-3xl">
            Ücretsiz {lang.name} Testi
          </h1>
          <p className="mt-2 text-slate-600">
            {FREE_TEST_SIZE} soruda {lang.name} seviyeni dene — kayıt gerekmez.
            Konular: {lang.sample}. Test bitince doğru cevapları hemen
            görürsün.
          </p>
        </div>

        {questions.length === 0 ? (
          <p className="text-sm text-slate-500">
            Bu test şu an hazır değil, lütfen daha sonra tekrar dene.
          </p>
        ) : (
          <FreeTest
            token={makeFreeTestToken(questions.map((q) => q.id))}
            questions={questions}
            otherLanguage={other}
          />
        )}

        <section className="rounded-xl border border-brand-100 bg-white p-5 text-sm text-slate-600 shadow-sm">
          <h2 className="font-medium text-brand-950">Ardemy Academy nedir?</h2>
          <p className="mt-1">
            Ardemy Academy, {lang.name} ve diğer dillerde konu anlatımları,
            çoktan seçmeli testler, günlük soru, deneme sınavları ve birebir
            ders takibi sunan bir dil öğrenme platformudur. Kayıt olunca 2
            kredi hediye edilir; kart bilgisi gerekmez.
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
