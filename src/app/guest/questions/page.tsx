import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { FlagIcon } from "@/components/FlagIcon";
import { slugify } from "@/lib/slugify";
import { getT } from "@/lib/i18n/server";

function languageOf(subject: string) {
  return subject.split(" - ")[0].trim();
}

export default async function GuestQuestionsLandingPage() {
  const t = await getT();
  const questions = await prisma.question.findMany({
    where: { isPublished: true },
    select: { id: true, subject: true, type: true },
  });

  const topicCounts = new Map<string, number>();
  const quizQuestionIds = new Map<string, string[]>();
  const openQuestionCounts = new Map<string, number>();

  for (const q of questions) {
    const language = languageOf(q.subject);
    if (q.type === "TOPIC") {
      topicCounts.set(language, (topicCounts.get(language) ?? 0) + 1);
    } else if (q.type === "QUIZ") {
      const ids = quizQuestionIds.get(language) ?? [];
      ids.push(q.id);
      quizQuestionIds.set(language, ids);
    } else {
      openQuestionCounts.set(language, (openQuestionCounts.get(language) ?? 0) + 1);
    }
  }

  // Her test 20 soru içerir — gerçek "toplam soru sayısı" için tek tek sayıyoruz.
  const soruCounts = new Map<string, number>();
  for (const [language, ids] of quizQuestionIds) {
    const count = await prisma.quizItem.count({
      where: { questionId: { in: ids } },
    });
    soruCounts.set(language, count + (openQuestionCounts.get(language) ?? 0));
  }

  const allLanguages = new Set([
    ...topicCounts.keys(),
    ...soruCounts.keys(),
  ]);
  const languages = Array.from(allLanguages)
    .map((language) => ({
      language,
      topicCount: topicCounts.get(language) ?? 0,
      soruCount: soruCounts.get(language) ?? 0,
    }))
    .sort((a, b) => a.language.localeCompare(b.language, "tr"));

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-brand-950">{t("İçerikler")}</h1>

      {languages.length === 0 ? (
        <p className="text-sm text-slate-500">
          {t("Şu anda yayınlanmış içerik bulunmuyor.")}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {languages.map(({ language, topicCount, soruCount }) => (
            <Link
              key={language}
              href={`/guest/questions/list/${slugify(language)}`}
              className="flex items-center gap-4 rounded-xl border border-brand-100 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
            >
              <FlagIcon language={language} className="h-10 w-14" />
              <div>
                <p className="text-lg font-semibold text-brand-950">
                  {t(language)}
                </p>
                <p className="text-sm font-medium text-gold-600">
                  {t("{n} {n#soru|soru}", { n: soruCount })}
                </p>
                <p className="text-xs text-slate-400">
                  {t("{n} {n#konu anlatımı|konu anlatımı}", { n: topicCount })}
                </p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
