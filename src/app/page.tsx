import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Logo } from "@/components/Logo";
import { Footer } from "@/components/Footer";

export default async function Home() {
  const session = await auth();

  if (session?.user) {
    if (session.user.role === "ADMIN") redirect("/admin");
    if (session.user.role === "GUEST") redirect("/guest");
    redirect("/student");
  }

  const [
    questionCount,
    topicCount,
    packages,
    studentCount,
    quizSubmissionCount,
    answerCount,
    streakAgg,
  ] = await Promise.all([
    prisma.question.count({ where: { isPublished: true, type: "QUESTION" } }),
    prisma.question.count({ where: { isPublished: true, type: "TOPIC" } }),
    prisma.creditPackage.findMany({
      where: { isActive: true },
      orderBy: { credits: "asc" },
      take: 3,
    }),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.quizSubmission.count(),
    prisma.questionAnswer.count(),
    prisma.user.aggregate({ _max: { longestStreak: true } }),
  ]);
  const quizCount = await prisma.question.count({
    where: { isPublished: true, type: "QUIZ" },
  });
  const solvedCount = quizSubmissionCount + answerCount;
  const longestStreak = streakAgg._max.longestStreak ?? 0;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo size={36} />
            <span className="font-semibold text-brand-950">Ardemy Academy</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-brand-700 hover:underline"
            >
              Giriş Yap
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:from-brand-500 hover:to-brand-400 hover:scale-[1.03] hover:shadow-lg active:scale-95"
            >
              Ücretsiz Kayıt Ol
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden bg-gradient-to-br from-brand-950 via-brand-800 to-brand-600 px-4 py-16 text-center sm:px-6 sm:py-24">
          <div className="pointer-events-none absolute -top-32 -left-32 h-80 w-80 rounded-full bg-gold-400/20 blur-3xl animate-float-slow" />
          <div className="pointer-events-none absolute -bottom-32 -right-16 h-96 w-96 rounded-full bg-brand-400/30 blur-3xl animate-float-slow-delayed" />
          <div className="relative mx-auto max-w-2xl">
            <h1 className="text-3xl font-semibold text-white sm:text-4xl">
              Dil öğrenmenin en pratik yolu
            </h1>
            <p className="mt-4 text-base text-brand-100 sm:text-lg">
              Konu anlatımları, çoktan seçmeli testler ve soru bankasıyla
              kendi hızında pratik yap; birebir ders takibiyle ilerlemeni
              öğretmeninle paylaş.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/register"
                className="w-full rounded-lg bg-gradient-to-r from-gold-500 to-gold-400 px-6 py-3 text-sm font-semibold text-brand-950 shadow-sm shadow-gold-600/30 transition-all duration-200 hover:from-gold-400 hover:to-gold-300 hover:scale-[1.03] hover:shadow-lg active:scale-95 sm:w-auto"
              >
                Ücretsiz Kayıt Ol
              </Link>
              <Link
                href="/login"
                className="w-full rounded-lg border border-white/30 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/10 sm:w-auto"
              >
                Zaten hesabım var
              </Link>
            </div>
            {(studentCount > 0 || solvedCount > 0 || longestStreak > 0) && (
              <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-brand-100">
                {studentCount > 0 && (
                  <span>
                    <strong className="text-white">{studentCount}</strong>{" "}
                    öğrenci
                  </span>
                )}
                {solvedCount > 0 && (
                  <span>
                    <strong className="text-white">{solvedCount}</strong>{" "}
                    çözülen soru/test
                  </span>
                )}
                {longestStreak > 0 && (
                  <span>
                    🔥 en uzun seri:{" "}
                    <strong className="text-white">{longestStreak}</strong> gün
                  </span>
                )}
              </div>
            )}
          </div>
        </section>

        <section className="px-4 py-12 sm:px-6">
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-brand-100 bg-white p-6 text-center shadow-sm">
              <p className="text-3xl font-semibold text-brand-950">
                {topicCount}
              </p>
              <p className="mt-1 text-sm text-slate-500">Konu Anlatımı</p>
            </div>
            <div className="rounded-xl border border-brand-100 bg-white p-6 text-center shadow-sm">
              <p className="text-3xl font-semibold text-brand-950">
                {quizCount}
              </p>
              <p className="mt-1 text-sm text-slate-500">Çoktan Seçmeli Test</p>
            </div>
            <div className="rounded-xl border border-brand-100 bg-white p-6 text-center shadow-sm">
              <p className="text-3xl font-semibold text-brand-950">
                {questionCount}
              </p>
              <p className="mt-1 text-sm text-slate-500">Alıştırma Sorusu</p>
            </div>
          </div>
        </section>

        <section className="bg-white px-4 py-12 sm:px-6">
          <div className="mx-auto max-w-5xl">
            <h2 className="text-center text-2xl font-semibold text-brand-950">
              Nasıl çalışır?
            </h2>
            <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                  1
                </div>
                <p className="mt-3 font-medium text-brand-950">Ücretsiz kayıt ol</p>
                <p className="mt-1 text-sm text-slate-500">
                  E-postanı doğrula, hemen platforma eriş.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                  2
                </div>
                <p className="mt-3 font-medium text-brand-950">Kredi al</p>
                <p className="mt-1 text-sm text-slate-500">
                  İhtiyacına göre kredi paketi seç, birçok içerik ücretsiz.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
                  3
                </div>
                <p className="mt-3 font-medium text-brand-950">
                  Çöz, öğren, serini sürdür
                </p>
                <p className="mt-1 text-sm text-slate-500">
                  🔥 Her gün pratik yaparak serini koru, 30 günde hediye ders kazan.
                </p>
              </div>
            </div>
          </div>
        </section>

        {packages.length > 0 && (
          <section className="px-4 py-12 sm:px-6">
            <div className="mx-auto max-w-5xl">
              <h2 className="text-center text-2xl font-semibold text-brand-950">
                Kredi Paketleri
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
                        kredi
                      </span>
                    </p>
                    <p className="mt-1 text-slate-700">
                      {Number(p.priceTRY).toLocaleString("tr-TR", {
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

        <section className="px-4 pb-16 text-center sm:px-6">
          <Link
            href="/register"
            className="inline-block rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-6 py-3 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:from-brand-500 hover:to-brand-400 hover:scale-[1.03] hover:shadow-lg active:scale-95"
          >
            Hemen Ücretsiz Kayıt Ol
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
