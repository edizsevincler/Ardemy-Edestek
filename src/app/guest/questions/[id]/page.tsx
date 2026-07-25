import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ProtectedContent } from "@/components/ProtectedContent";
import { AnswerForm } from "./AnswerForm";

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

  const answer = await prisma.questionAnswer.findUnique({
    where: { userId_questionId: { userId, questionId: id } },
  });

  const watermarkText = `${session!.user.email ?? session!.user.name} • ${new Date().toLocaleString("tr-TR")}`;

  return (
    <div className="space-y-4">
      <Link
        href="/guest/questions"
        className="text-sm text-slate-500 hover:text-brand-700"
      >
        ← Soru Bankası
      </Link>

      <ProtectedContent watermarkText={watermarkText}>
        <div className="rounded-xl border border-brand-100 bg-white p-6 shadow-sm">
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

          {question.fileUrl && (
            <a
              href={`/api/questions/${question.id}/file`}
              className="mt-4 inline-block rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:from-brand-500 hover:to-brand-400"
            >
              Dosyayı İndir
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
