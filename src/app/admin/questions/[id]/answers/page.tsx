import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { FeedbackForm } from "./FeedbackForm";

export default async function QuestionAnswersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const question = await prisma.question.findUnique({ where: { id } });
  if (!question) {
    notFound();
  }

  const answers = await prisma.questionAnswer.findMany({
    where: { questionId: id },
    orderBy: { submittedAt: "desc" },
    include: { user: { select: { name: true, email: true, username: true, role: true } } },
  });

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/questions"
          className="text-sm text-slate-500 hover:text-brand-700"
        >
          ← Soru Bankası
        </Link>
        <h1 className="text-2xl font-semibold text-brand-950">
          {question.title} — Cevaplar
        </h1>
      </div>

      {answers.length === 0 ? (
        <p className="text-sm text-slate-500">Henüz cevap gönderilmedi.</p>
      ) : (
        <div className="space-y-4">
          {answers.map((a) => (
            <div
              key={a.id}
              className="rounded-xl border border-brand-100 bg-white transition-shadow duration-200 hover:shadow-md p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="font-medium text-brand-950">
                  {a.user.name}{" "}
                  <span className="font-normal text-slate-400">
                    ({a.user.email ?? a.user.username})
                  </span>{" "}
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-normal text-slate-500">
                    {a.user.role === "STUDENT" ? "Öğrenci" : "Misafir"}
                  </span>
                </p>
                <p className="text-xs text-slate-400">
                  {a.submittedAt.toLocaleString("tr-TR")}
                </p>
              </div>

              {a.body && (
                <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                  {a.body}
                </p>
              )}
              {a.fileUrl && (
                <a
                  href={`/api/question-answers/${a.id}/file`}
                  className="mt-2 inline-block text-sm text-brand-600 underline"
                >
                  {a.fileName}
                </a>
              )}

              <FeedbackForm
                answerId={a.id}
                questionId={id}
                currentFeedback={a.feedback}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
