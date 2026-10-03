import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ExamStartButtons } from "@/components/ExamStartButtons";
import { getI18n } from "@/lib/i18n/server";
import { INTL_TAG } from "@/lib/i18n/config";
import {
  EXAM_LANGUAGES,
  EXAM_MINUTES,
  EXAM_PRICE_CREDITS,
  EXAM_RESUME_HOURS,
  EXAM_SIZE,
} from "@/lib/exam-config";

export default async function ExamHomePage() {
  const { locale, t } = await getI18n();
  const session = await auth();
  const userId = session!.user.id;

  const resumeAfter = new Date();
  resumeAfter.setHours(resumeAfter.getHours() - EXAM_RESUME_HOURS);

  const [me, pool, open, attempts] = await Promise.all([
    prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: { credits: true },
    }),
    prisma.examQuestion.groupBy({ by: ["language"], _count: { _all: true } }),
    prisma.examAttempt.findFirst({
      where: { userId, submittedAt: null, startedAt: { gt: resumeAfter } },
      orderBy: { startedAt: "desc" },
    }),
    prisma.examAttempt.findMany({
      where: { userId, submittedAt: { not: null } },
      orderBy: { startedAt: "desc" },
      take: 10,
    }),
  ]);

  const languages = EXAM_LANGUAGES.map((language) => ({
    language: language as string,
    count: pool.find((p) => p.language === language)?._count._all ?? 0,
  })).filter((l) => l.count >= EXAM_SIZE);

  const best = attempts.reduce((max, a) => Math.max(max, a.score ?? 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-brand-950">{t("📝 Deneme Sınavı")}</h1>
        <span className="rounded-full bg-gold-100 px-3 py-1 text-sm font-medium text-gold-700">
          {t("{n} kredi", { n: me.credits })}
        </span>
      </div>

      <div className="rounded-xl border border-brand-100 bg-white p-5 shadow-sm">
        <ul className="space-y-1.5 text-sm text-slate-600">
          <li>
            {t("📌 {n} soru, {m} dakika süre. Süre dolunca cevapların otomatik gönderilir.", { n: EXAM_SIZE, m: EXAM_MINUTES })}
          </li>
          <li>
            {t("🆕 Sorular soru bankasındaki testlerden bağımsız, özgün sorulardır; her seferinde daha önce görmediklerin öncelikli gelir.")}
          </li>
          <li>
            {t("💡 Sınav bitince her sorunun doğru cevabını ve kısa açıklamasını görürsün.")}
          </li>
          <li>
            {t("🔥 Sınavı bitirmek günlük serine de sayılır. Ücret: {n} kredi.", { n: EXAM_PRICE_CREDITS })}
          </li>
        </ul>

        <div className="mt-4">
          {open ? (
            <div className="space-y-2">
              <p className="text-sm text-slate-600">
                {t("Yarım kalmış bir sınavın var — yeniden ücret alınmaz.")}
              </p>
              <Link
                href={`/guest/exam/${open.id}`}
                className="inline-block rounded-lg bg-gradient-to-r from-gold-500 to-gold-400 px-4 py-2 text-sm font-semibold text-brand-950 shadow-sm transition-all duration-200 hover:scale-[1.03] active:scale-95"
              >
                {t("Sınava devam et")}
              </Link>
            </div>
          ) : languages.length === 0 ? (
            <p className="text-sm text-slate-500">
              {t("Deneme soruları çok yakında eklenecek.")}
            </p>
          ) : (
            <ExamStartButtons
              languages={languages}
              price={EXAM_PRICE_CREDITS}
              credits={me.credits}
            />
          )}
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-medium text-brand-950">
          {t("Geçmiş Denemelerim")}
          {attempts.length > 0 && (
            <span className="ml-2 text-sm font-normal text-slate-400">
              {t("en iyi skor: {a}/{b}", { a: best, b: EXAM_SIZE })}
            </span>
          )}
        </h2>
        {attempts.length === 0 ? (
          <p className="text-sm text-slate-500">{t("Henüz deneme sınavı çözmedin.")}</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-brand-100 bg-white shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-slate-500">
                  <th className="px-4 py-2 font-medium">{t("Tarih")}</th>
                  <th className="px-4 py-2 font-medium">{t("Dil")}</th>
                  <th className="px-4 py-2 font-medium">{t("Skor")}</th>
                  <th className="px-4 py-2 font-medium" />
                </tr>
              </thead>
              <tbody>
                {attempts.map((a) => (
                  <tr key={a.id} className="border-b border-slate-50 last:border-0">
                    <td className="px-4 py-2 text-slate-600">
                      {a.startedAt.toLocaleString(INTL_TAG[locale], {
                        timeZone: "Europe/Istanbul",
                      })}
                    </td>
                    <td className="px-4 py-2 text-slate-900">{t(a.language)}</td>
                    <td className="px-4 py-2 font-medium text-brand-950">
                      {a.score}/{a.total}
                    </td>
                    <td className="px-4 py-2 text-right">
                      <Link
                        href={`/guest/exam/${a.id}`}
                        className="text-brand-600 underline"
                      >
                        {t("İncele")}
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
