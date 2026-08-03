import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { FlagIcon } from "@/components/FlagIcon";
import { slugify } from "@/lib/slugify";

function languageOf(subject: string) {
  return subject.split(" - ")[0].trim();
}

export default async function GuestQuestionsLandingPage() {
  const questions = await prisma.question.findMany({
    where: { isPublished: true },
    select: { subject: true },
  });

  const counts = new Map<string, number>();
  for (const q of questions) {
    const language = languageOf(q.subject);
    counts.set(language, (counts.get(language) ?? 0) + 1);
  }

  const languages = Array.from(counts.entries()).sort((a, b) =>
    a[0].localeCompare(b[0], "tr")
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-brand-950">İçerikler</h1>

      {languages.length === 0 ? (
        <p className="text-sm text-slate-500">
          Şu anda yayınlanmış içerik bulunmuyor.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {languages.map(([language, count]) => (
            <Link
              key={language}
              href={`/guest/questions/list/${slugify(language)}`}
              className="flex items-center gap-4 rounded-xl border border-brand-100 bg-white p-6 shadow-sm transition-all duration-200 hover:shadow-md hover:scale-[1.02]"
            >
              <FlagIcon language={language} className="h-10 w-14" />
              <div>
                <p className="text-lg font-semibold text-brand-950">
                  {language}
                </p>
                <p className="text-sm text-slate-500">{count} içerik</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
