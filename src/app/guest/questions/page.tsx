import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { UnlockButton } from "./UnlockButton";

type QuestionItem = {
  id: string;
  title: string;
  subject: string;
  creditCost: number;
};

function groupBySubject(items: QuestionItem[]) {
  const groups = new Map<string, QuestionItem[]>();
  for (const item of items) {
    const list = groups.get(item.subject) ?? [];
    list.push(item);
    groups.set(item.subject, list);
  }
  return Array.from(groups.entries());
}

function QuestionSection({
  title,
  items,
  unlockedIds,
}: {
  title: string;
  items: QuestionItem[];
  unlockedIds: Set<string>;
}) {
  if (items.length === 0) return null;

  const groups = groupBySubject(items);

  return (
    <section className="space-y-4">
      <h2 className="text-lg font-medium text-brand-950">{title}</h2>
      <div className="space-y-6">
        {groups.map(([subject, groupItems]) => (
          <div
            key={subject}
            className="space-y-3 rounded-xl border border-brand-200 bg-brand-50/40 p-4"
          >
            <h3 className="text-xs font-semibold uppercase tracking-wide text-brand-600">
              {subject}
            </h3>
            <div className="space-y-3">
              {groupItems.map((q) => {
                const isUnlocked = unlockedIds.has(q.id);
                return (
                  <div
                    key={q.id}
                    className="flex items-center justify-between gap-4 rounded-xl border border-brand-100 bg-white transition-shadow duration-200 hover:shadow-md p-4 shadow-sm"
                  >
                    <p className="font-medium text-brand-950">
                      {isUnlocked ? q.title : "🔒 " + q.title}
                    </p>
                    {isUnlocked ? (
                      <Link
                        href={`/guest/questions/${q.id}`}
                        className="rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-3 py-1.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:from-brand-500 hover:to-brand-400 hover:scale-[1.03] hover:shadow-lg active:scale-95"
                      >
                        Görüntüle
                      </Link>
                    ) : (
                      <UnlockButton questionId={q.id} creditCost={q.creditCost} />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default async function GuestQuestionsPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [questions, unlocks] = await Promise.all([
    prisma.question.findMany({
      where: { isPublished: true },
      orderBy: [{ subject: "asc" }, { createdAt: "desc" }],
    }),
    prisma.questionUnlock.findMany({
      where: { userId },
      select: { questionId: true },
    }),
  ]);

  const unlockedIds = new Set(unlocks.map((u) => u.questionId));
  const topics = questions.filter((q) => q.type === "TOPIC");
  const exercises = questions.filter((q) => q.type !== "TOPIC");

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-brand-950">Soru Bankası</h1>

      {questions.length === 0 ? (
        <p className="text-sm text-slate-500">
          Şu anda yayınlanmış içerik bulunmuyor.
        </p>
      ) : (
        <>
          <QuestionSection
            title="📘 Konu Anlatımı"
            items={topics}
            unlockedIds={unlockedIds}
          />
          <QuestionSection
            title="📝 Sorular"
            items={exercises}
            unlockedIds={unlockedIds}
          />
        </>
      )}
    </div>
  );
}
