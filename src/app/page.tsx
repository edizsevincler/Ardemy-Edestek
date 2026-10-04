import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Logo } from "@/components/Logo";
import { Footer } from "@/components/Footer";
import { SIGNUP_BONUS_CREDITS } from "@/lib/credits";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ThemeToggle } from "@/components/ThemeToggle";
import { getI18n } from "@/lib/i18n/server";
import { INTL_TAG } from "@/lib/i18n/config";
import { FlagIcon } from "@/components/FlagIcon";
import { HomeDemo, type DemoSet } from "@/components/HomeDemo";
import { pickDemoQuestion } from "@/lib/free-test";
import { previewBadges } from "@/lib/badges";
import { tx } from "@/lib/i18n/translate";
import { ttlCached } from "@/lib/ttl-cache";
import { INSTRUCTOR, TESTIMONIALS } from "@/lib/site-content";
import Image from "next/image";

const FEATURES = [
  { emoji: "📅", title: tx("Günün Sorusu ve seri"), text: tx("Her gün yeni bir soru çöz, serini koru; hediye ödüller kazan.") },
  { emoji: "📝", title: tx("Deneme sınavları"), text: tx("Gerçek sınav havasında, süreli deneme sınavlarıyla seviyeni ölç.") },
  { emoji: "🏅", title: tx("Rozetler ve mağaza"), text: tx("Başardıkça rozet topla, kredilerinle unvan ve çerçeve al.") },
  { emoji: "👩‍🏫", title: tx("Birebir ders takibi"), text: tx("Ödevler, ders dosyaları ve mesajlarla öğretmeninle bağlantıda kal.") },
  { emoji: "🌍", title: tx("Üç dilde arayüz"), text: tx("Türkçe, İngilizce ve Rusça: site tarayıcının diline göre açılır.") },
  { emoji: "📲", title: tx("Telefonda uygulama gibi"), text: tx("Ana ekrana ekle, tek dokunuşla aç; mobilde rahat kullan.") },
];

const SHOWCASE_BADGES = [
  "first-quiz", "perfect", "streak3", "streak7", "streak30", "daily5", "50-quiz", "perfect10",
];

const FAQ = [
  { q: tx("Gerçekten ücretsiz mi?"), a: tx("Kayıt ücretsiz; kayıt olunca {n} kredi hediye edilir, kart bilgisi gerekmez. Günün Sorusu ve ücretsiz testler her zaman ücretsiz.") },
  { q: tx("Kredi ne işe yarıyor?"), a: tx("Konu anlatımı, test ve soru gibi içeriklerin kilidini açmak için kullanılır. İstediğin zaman paketlerden ekleyebilirsin.") },
  { q: tx("Telefonda kullanabilir miyim?"), a: tx("Evet. Siteyi tarayıcıdan ana ekranına ekleyip uygulama gibi açabilirsin; arayüz Türkçe, İngilizce ve Rusça desteklenir.") },
];

export default async function Home() {
  const { locale, t } = await getI18n();
  const session = await auth();

  if (session?.user) {
    if (session.user.role === "ADMIN") redirect("/admin");
    if (session.user.role === "GUEST") redirect("/guest");
    redirect("/student");
  }

  // Herkese aynı olan sayılar 10 dakika önbellekte tutulur (sayfa her açılışta
  // 5 ayrı sorgu atmasın). Demo sorusu her ziyarette yeniden seçilir.
  const stats = await ttlCached("home-stats", 10 * 60 * 1000, async () => {
    const [topicCount, packages, quizCount, quizItemCount, openQuestionCount] = await Promise.all([
      prisma.question.count({ where: { isPublished: true, type: "TOPIC" } }),
      prisma.creditPackage.findMany({
        where: { isActive: true },
        orderBy: { credits: "asc" },
        take: 3,
      }),
      prisma.question.count({ where: { isPublished: true, type: "QUIZ" } }),
      prisma.quizItem.count({ where: { question: { isPublished: true, type: "QUIZ" } } }),
      prisma.question.count({ where: { isPublished: true, type: "QUESTION" } }),
    ]);
    return { topicCount, packages, quizCount, totalSoruCount: quizItemCount + openQuestionCount };
  });
  const { topicCount, packages, quizCount, totalSoruCount } = stats;
  const demoResults = await Promise.all([pickDemoQuestion("Rusça"), pickDemoQuestion("İngilizce")]);
  const demoSets: DemoSet[] = [];
  if (demoResults[0]) demoSets.push({ language: "Rusça", ...demoResults[0] });
  if (demoResults[1]) demoSets.push({ language: "İngilizce", ...demoResults[1] });
  const badges = previewBadges(SHOWCASE_BADGES);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo size={36} />
            <span className="font-semibold text-brand-950">Ardemy Academy</span>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle tone="light" />
            <LanguageSwitcher />
            <Link
              href="/login"
              className="text-sm font-medium text-brand-700 hover:underline"
            >
              {t("Giriş Yap")}
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:from-brand-500 hover:to-brand-400 hover:scale-[1.03] hover:shadow-lg active:scale-95"
            >
              {t("Ücretsiz Kayıt Ol")}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-800 to-brand-600 px-4 py-12 sm:px-6 sm:py-20">
          <div className="pointer-events-none absolute -top-32 -left-32 h-80 w-80 rounded-full bg-gold-400/20 blur-3xl animate-float-slow" />
          <div className="pointer-events-none absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-brand-400/30 blur-3xl animate-float-slow-delayed" />
          <div className="relative mx-auto grid max-w-5xl items-center gap-10 lg:grid-cols-2">
            <div className="text-center lg:text-left">
              <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-gold-300">
                <FlagIcon language="Rusça" className="h-3 w-4" />
                {t("Rusça")}
                <span aria-hidden>·</span>
                <FlagIcon language="İngilizce" className="h-3 w-4" />
                {t("İngilizce")}
              </p>
              <h1 className="mt-4 text-3xl font-semibold leading-tight text-white sm:text-5xl">
                {t("Rusça ve İngilizce, her gün 5 dakika")}
              </h1>
              <p className="mt-4 text-base text-brand-100 sm:text-lg">
                {t("Konu anlatımları, çoktan seçmeli testler ve soru bankasıyla kendi hızında pratik yap; birebir ders takibiyle ilerlemeni öğretmeninle paylaş.")}
              </p>
              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center lg:justify-start">
                <Link
                  href="/register"
                  className="w-full rounded-lg bg-gradient-to-r from-gold-500 to-gold-400 px-6 py-3 text-sm font-semibold text-brand-950 shadow-sm shadow-gold-600/30 transition-all duration-200 hover:from-gold-400 hover:to-gold-300 hover:scale-[1.03] hover:shadow-lg active:scale-95 sm:w-auto"
                >
                  {t("Ücretsiz Kayıt Ol")}
                </Link>
                <Link
                  href="/login"
                  className="w-full rounded-lg border border-white/30 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/10 sm:w-auto"
                >
                  {t("Zaten hesabım var")}
                </Link>
              </div>
              <p className="mt-4">
                <Link
                  href="/dene"
                  className="text-sm font-medium text-gold-300 underline underline-offset-4 hover:text-gold-400"
                >
                  {t("Önce ücretsiz dene — kayıt olmadan 5 soruluk test çöz →")}
                </Link>
              </p>
              <p className="mt-4 inline-block rounded-full bg-gold-400/20 px-4 py-1.5 text-sm font-medium text-gold-300">
                {t("🎁 Kayıt olunca {n} kredi hediye — kart bilgisi gerekmez", { n: SIGNUP_BONUS_CREDITS })}
              </p>
            </div>
            {demoSets.length > 0 && <HomeDemo sets={demoSets} />}
          </div>
        </section>

        <section className="px-4 py-12 sm:px-6">
          <div className="mx-auto grid max-w-3xl grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-gold-200 bg-gold-50 p-6 text-center shadow-sm sm:order-first">
              <p className="text-3xl font-semibold text-brand-950">
                {totalSoruCount.toLocaleString(INTL_TAG[locale])}
              </p>
              <p className="mt-1 text-sm text-slate-600">{t("Soru")}</p>
            </div>
            <div className="rounded-xl border border-brand-100 bg-white p-6 text-center shadow-sm">
              <p className="text-3xl font-semibold text-brand-950">
                {topicCount}
              </p>
              <p className="mt-1 text-sm text-slate-500">{t("Konu Anlatımı")}</p>
            </div>
            <div className="rounded-xl border border-brand-100 bg-white p-6 text-center shadow-sm">
              <p className="text-3xl font-semibold text-brand-950">
                {quizCount}
              </p>
              <p className="mt-1 text-sm text-slate-500">{t("Çoktan Seçmeli Test")}</p>
            </div>
          </div>
        </section>

        <section className="bg-white px-4 py-12 sm:px-6">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-2xl font-semibold text-brand-950">
              {t("Nasıl çalışır?")}
            </h2>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                  1
                </div>
                <p className="mt-3 font-medium text-brand-950">{t("Ücretsiz kayıt ol")}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {t("E-postanı doğrula, hemen platforma eriş.")}
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                  2
                </div>
                <p className="mt-3 font-medium text-brand-950">{t("Kredi al")}</p>
                <p className="mt-1 text-sm text-slate-500">
                  {t("Kayıtla {n} kredi hediye, ihtiyacına göre daha fazlasını ekleyebilirsin.", { n: SIGNUP_BONUS_CREDITS })}
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                  3
                </div>
                <p className="mt-3 font-medium text-brand-950">
                  {t("Çöz, öğren, serini sürdür")}
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  {t("🔥 Her gün pratik yaparak serini koru, 30 günde hediye ders kazan.")}
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-4 py-12 sm:px-6">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-2xl font-semibold text-brand-950">
              {t("Neden Ardemy?")}
            </h2>
            <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURES.map((f) => (
                <div
                  key={f.title}
                  className="rounded-xl border border-brand-100 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md"
                >
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-2xl">
                    {f.emoji}
                  </div>
                  <p className="mt-3 font-medium text-brand-950">{t(f.title)}</p>
                  <p className="mt-1 text-sm text-slate-500">{t(f.text)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-12 sm:px-6">
          <div className="mx-auto max-w-3xl">
            <div className="flex flex-col items-center gap-6 rounded-2xl border border-brand-100 bg-white p-6 text-center shadow-sm sm:flex-row sm:text-left">
              {INSTRUCTOR.photo ? (
                <Image
                  src={INSTRUCTOR.photo}
                  alt={INSTRUCTOR.name}
                  width={112}
                  height={112}
                  className="h-28 w-28 shrink-0 rounded-full object-cover ring-4 ring-brand-100"
                />
              ) : (
                <div
                  aria-hidden
                  className="flex h-28 w-28 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-brand-400 text-3xl font-semibold text-white ring-4 ring-brand-100"
                >
                  {INSTRUCTOR.name
                    .split(" ")
                    .map((part) => part[0])
                    .slice(0, 2)
                    .join("")}
                </div>
              )}
              <div>
                <p className="text-xs font-medium uppercase tracking-wide text-brand-500">
                  {t("Eğitmenle tanış")}
                </p>
                <h2 className="mt-1 text-xl font-semibold text-brand-950">{INSTRUCTOR.name}</h2>
                <p className="text-sm text-slate-500">{t(INSTRUCTOR.role)}</p>
                <p className="mt-3 text-sm text-slate-600">{t(INSTRUCTOR.bio)}</p>
                <a
                  href={`https://www.instagram.com/${INSTRUCTOR.instagram.replace("@", "")}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-block text-sm font-medium text-brand-600 hover:underline"
                >
                  {t("Instagram'da takip et: @edizsevincler")}
                </a>
              </div>
            </div>
          </div>
        </section>

        {TESTIMONIALS.length > 0 && (
          <section className="px-4 pb-12 sm:px-6">
            <div className="mx-auto max-w-5xl">
              <h2 className="text-center text-2xl font-semibold text-brand-950">
                {t("Öğrenciler ne diyor?")}
              </h2>
              <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {TESTIMONIALS.map((item) => (
                  <figure
                    key={item.name + item.quote}
                    className="rounded-xl border border-brand-100 bg-white p-5 shadow-sm"
                  >
                    <blockquote className="text-sm text-slate-700">“{item.quote}”</blockquote>
                    <figcaption className="mt-3 text-sm">
                      <span className="font-medium text-brand-950">{item.name}</span>
                      {item.detail && <span className="text-slate-500"> · {item.detail}</span>}
                    </figcaption>
                  </figure>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="bg-gradient-to-br from-brand-950 to-brand-800 px-4 py-12 sm:px-6">
          <div className="mx-auto max-w-5xl text-center">
            <h2 className="text-2xl font-semibold text-white">
              {t("Seriyi koru, rozetleri topla")}
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-brand-100">
              {t("Her gün küçük bir adım at; seri uzadıkça rozetler ve ödüller açılır.")}
            </p>
            <div className="mt-6 flex items-center justify-center gap-2">
              {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                <span
                  key={d}
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-semibold sm:h-10 sm:w-10 ${
                    d === 7
                      ? "bg-orange-500 text-white animate-ember"
                      : "bg-gold-400/90 text-brand-950"
                  }`}
                >
                  {d === 7 ? <span className="animate-flicker">🔥</span> : d}
                </span>
              ))}
            </div>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {badges.map((b) => (
                <div
                  key={b.id}
                  className="rounded-xl border border-white/15 bg-white/10 p-4 backdrop-blur"
                >
                  <p className="text-3xl">{b.emoji}</p>
                  <p className="mt-2 text-sm font-semibold text-white">{t(b.title)}</p>
                  <p className="mt-0.5 text-xs text-brand-200">{t(b.description)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {packages.length > 0 && (
          <section className="px-4 py-12 sm:px-6">
            <div className="mx-auto max-w-5xl">
              <h2 className="text-center text-2xl font-semibold text-brand-950">
                {t("Kredi Paketleri")}
              </h2>
              <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {packages.map((p) => (
                  <div
                    key={p.id}
                    className="rounded-xl border border-brand-100 bg-white p-6 text-center shadow-sm"
                  >
                    <p className="text-sm font-medium text-brand-600">{p.name}</p>
                    <p className="mt-2 text-2xl font-semibold text-brand-950">
                      {p.credits}
                      <span className="ml-1 text-sm font-normal text-slate-500">
                        {t("kredi")}
                      </span>
                    </p>
                    <p className="mt-1 text-slate-700">
                      {Number(p.priceTRY).toLocaleString(INTL_TAG[locale], {
                        style: "currency",
                        currency: "TRY",
                      })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="px-4 py-12 sm:px-6">
          <div className="mx-auto max-w-2xl">
            <h2 className="text-center text-2xl font-semibold text-brand-950">
              {t("Sık sorulan sorular")}
            </h2>
            <div className="mt-6 space-y-3">
              {FAQ.map((item) => (
                <details
                  key={item.q}
                  className="group rounded-xl border border-brand-100 bg-white p-4 shadow-sm"
                >
                  <summary className="flex min-h-8 cursor-pointer list-none items-center justify-between gap-3 font-medium text-brand-950">
                    {t(item.q)}
                    <span className="text-brand-500 transition-transform group-open:rotate-45">+</span>
                  </summary>
                  <p className="mt-2 text-sm text-slate-600">
                    {t(item.a, { n: SIGNUP_BONUS_CREDITS })}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 pb-16 text-center sm:px-6">
          <Link
            href="/register"
            className="inline-block rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-3 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:from-brand-500 hover:to-brand-400 hover:scale-[1.03] hover:shadow-lg active:scale-95"
          >
            {t("Hemen Ücretsiz Kayıt Ol")}
          </Link>
          <p className="mt-4 text-sm text-slate-500">
            <a
              href="https://www.instagram.com/edizsevincler/"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-brand-600 hover:underline"
            >
              {t("Instagram'da takip et: @edizsevincler")}
            </a>
          </p>
        </section>
      </main>

      <Footer />
    </div>
  );
}
