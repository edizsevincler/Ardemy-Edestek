import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ProtectedContent } from "@/components/ProtectedContent";
import { AnswerForm } from "./AnswerForm";
import { QuizForm } from "./QuizForm";
import { UnlockButton } from "../UnlockButton";
import { slugify } from "@/lib/slugify";

export default async function GuestQuestionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const userId = session!.user.id;

  const question = await prisma.question.findUnique({ where: { id } });
  if (!question || !question.isPublished) {
    notFound();
  }

  const unlock = await prisma.questionUnlock.findUnique({
    where: { userId_questionId: { userId, questionId: id } },
  });

  const watermarkText = `${session!.user.name} • ${new Date().toLocaleString("tr-TR")}`;
  const language = question.subject.split(" - ")[0].trim();

  const backLink = (
    <Link
      href={`/guest/questions/list/${slugify(language)}`}
      className="text-sm text-slate-500 hover:text-brand-700"
    >
      ← {language}
    </Link>
  );

  const header = (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-brand-500">
        {question.subject}
      </p>
      <h1 className="mt-1 text-xl font-semibold text-brand-950">
        {question.title}
      </h1>
    </div>
  );

  if (question.type === "QUIZ") {
    const items = await prisma.quizItem.findMany({
      where: { questionId: id },
      orderBy: { order: "asc" },
      select: {
        id: true,
        order: true,
        prompt: true,
        optionA: true,
        optionB: true,
        optionC: true,
        optionD: true,
      },
    });

    if (!unlock) {
      const firstItem = items[0];
      return (
        <div className="space-y-4">
          {backLink}
          {header}
          {firstItem && (
            <div className="rounded-xl border border-brand-100 bg-white p-4 shadow-sm">
              <p className="font-medium text-brand-950">1. {firstItem.prompt}</p>
              <div className="mt-3 space-y-2">
                {(["A", "B", "C", "D"] as const).map((opt) => (
                  <div
                    key={opt}
                    className="rounded-lg border border-slate-200 p-2 text-sm text-slate-500"
                  >
                    {opt}) {firstItem[`option${opt}` as const]}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="rounded-xl border border-gold-200 bg-gold-50 p-4 text-center">
            <p className="text-sm text-brand-900">
              🔒 Bu ücretsiz önizleme — kalan {Math.max(items.length - 1, 0)}{" "}
              soruyu çözmek ve puanını görmek için kilidi aç.
            </p>
            <div className="mt-3 flex justify-center">
              <UnlockButton questionId={question.id} creditCost={question.creditCost} />
            </div>
          </div>
        </div>
      );
    }

    const submission = await prisma.quizSubmission.findUnique({
      where: { userId_questionId: { userId, questionId: id } },
    });

    return (
      <div className="space-y-4">
        {backLink}
        {header}

        <ProtectedContent watermarkText={watermarkText}>
          <QuizForm
            questionId={question.id}
            items={items}
            existingSubmission={
              submission
                ? {
                    score: submission.score,
                    total: submission.total,
                    answers: submission.answers as {
                      itemId: string;
                      selected: "A" | "B" | "C" | "D";
                      correct: boolean;
                    }[],
                  }
                : null
            }
          />
        </ProtectedContent>
        <p className="text-xs text-slate-400">
          🔒 Bu içerik yalnızca kişisel kullanımınız içindir; izinsiz
          paylaşım, çoğaltım veya satış telif hakkı ihlalidir.
        </p>
      </div>
    );
  }

  const isPdf = question.fileUrl && question.fileName?.toLowerCase().endsWith(".pdf");

  if (!unlock) {
    return (
      <div className="space-y-4">
        {backLink}
        <div className="rounded-xl border border-brand-100 bg-white p-6 shadow-sm">
          {header}

          {question.body && (
            <p className="mt-4 whitespace-pre-wrap text-slate-700">
              {question.body.slice(0, 220)}
              {question.body.length > 220 ? "…" : ""}
            </p>
          )}

          {isPdf && (
            <>
              <iframe
                src={`/api/questions/${question.id}/preview`}
                className="mt-4 h-[50vh] w-full rounded-lg border border-slate-200"
                title={`${question.title} — önizleme`}
              />
              <p className="mt-2 text-xs text-slate-400">
                Sadece ilk sayfa gösteriliyor
                {question.pageCount ? ` (toplam ${question.pageCount} sayfa)` : ""}.
              </p>
            </>
          )}

          <div className="mt-4 rounded-xl border border-gold-200 bg-gold-50 p-4 text-center">
            <p className="text-sm text-brand-900">
              🔒 Devamını görmek için kilidi aç.
            </p>
            <div className="mt-3 flex justify-center">
              <UnlockButton questionId={question.id} creditCost={question.creditCost} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const answer = await prisma.questionAnswer.findUnique({
    where: { userId_questionId: { userId, questionId: id } },
  });

  return (
    <div className="space-y-4">
      {backLink}

      <ProtectedContent watermarkText={watermarkText}>
        <div className="rounded-xl border border-brand-100 bg-white transition-shadow duration-200 hover:shadow-md p-6 shadow-sm">
          {header}

          {question.body && (
            <p className="mt-4 whitespace-pre-wrap text-slate-700">
              {question.body}
            </p>
          )}

          {isPdf && (
            <iframe
              src={`/api/questions/${question.id}/file`}
              className="mt-4 h-[75vh] w-full rounded-lg border border-slate-200"
              title={question.title}
            />
          )}

          {question.fileUrl && !isPdf && (
            <a
              href={`/api/questions/${question.id}/file`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-block rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:from-brand-500 hover:to-brand-400 hover:scale-[1.03] hover:shadow-lg active:scale-95"
            >
              Dosyayı Görüntüle
            </a>
          )}
        </div>
      </ProtectedContent>
      <p className="text-xs text-slate-400">
        🔒 Bu içerik yalnızca kişisel kullanımınız içindir; izinsiz paylaşım,
        çoğaltım veya satış telif hakkı ihlalidir.
      </p>

      {question.type !== "TOPIC" && (
        <AnswerForm questionId={question.id} answer={answer} />
      )}
    </div>
  );
}
