import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ProtectedContent } from "@/components/ProtectedContent";
import { AnswerForm } from "./AnswerForm";
import { QuizForm } from "./QuizForm";
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
  if (!question) {
    notFound();
  }

  const unlock = await prisma.questionUnlock.findUnique({
    where: { userId_questionId: { userId, questionId: id } },
  });
  if (!unlock) {
    redirect("/guest/questions");
  }

  const watermarkText = `${session!.user.email ?? session!.user.name} • ${new Date().toLocaleString("tr-TR")}`;
  const language = question.subject.split(" - ")[0].trim();

  if (question.type === "QUIZ") {
    const [items, submission] = await Promise.all([
      prisma.quizItem.findMany({
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
      }),
      prisma.quizSubmission.findUnique({
        where: { userId_questionId: { userId, questionId: id } },
      }),
    ]);

    return (
      <div className="space-y-4">
        <Link
          href={`/guest/questions/list/${slugify(language)}`}
          className="text-sm text-slate-500 hover:text-brand-700"
        >
          ← {language}
        </Link>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-brand-500">
            {question.subject}
          </p>
          <h1 className="mt-1 text-xl font-semibold text-brand-950">
            {question.title}
          </h1>
        </div>

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
      </div>
    );
  }

  const answer = await prisma.questionAnswer.findUnique({
    where: { userId_questionId: { userId, questionId: id } },
  });

  return (
    <div className="space-y-4">
      <Link
        href={`/guest/questions/list/${slugify(language)}`}
        className="text-sm text-slate-500 hover:text-brand-700"
      >
        ← {language}
      </Link>

      <ProtectedContent watermarkText={watermarkText}>
        <div className="rounded-xl border border-brand-100 bg-white transition-shadow duration-200 hover:shadow-md p-6 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-brand-500">
            {question.subject}
          </p>
          <h1 className="mt-1 text-xl font-semibold text-brand-950">
            {question.title}
          </h1>

          {question.body && (
            <p className="mt-4 whitespace-pre-wrap text-slate-700">
              {question.body}
            </p>
          )}

          {question.fileUrl && question.fileName?.toLowerCase().endsWith(".pdf") && (
            <iframe
              src={`/api/questions/${question.id}/file`}
              className="mt-4 h-[75vh] w-full rounded-lg border border-slate-200"
              title={question.title}
            />
          )}

          {question.fileUrl && !question.fileName?.toLowerCase().endsWith(".pdf") && (
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

      {question.type !== "TOPIC" && (
        <AnswerForm questionId={question.id} answer={answer} />
      )}
    </div>
  );
}
