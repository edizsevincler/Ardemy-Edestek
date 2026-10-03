import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { buildExamReview } from "@/lib/exam";
import { ExamRunner } from "@/components/ExamRunner";
import { ExamResultView } from "@/components/ExamResultView";
import { EXAM_MINUTES, type ExamLetter } from "@/lib/exam-config";
import { getReferralShareUrl } from "@/lib/referral";

export default async function ExamAttemptPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const attempt = await prisma.examAttempt.findUnique({ where: { id } });
  if (!attempt || attempt.userId !== session!.user.id) notFound();

  const questionIds = attempt.questionIds as string[];
  const shareUrl = await getReferralShareUrl(attempt.userId);

  if (attempt.submittedAt) {
    const review = await buildExamReview(
      questionIds,
      (attempt.answers ?? []) as {
        questionId: string;
        selected: ExamLetter | null;
        correct: boolean;
      }[]
    );
    return (
      <div className="space-y-4">
        <Link href="/guest/exam" className="text-sm text-brand-600 underline">
          ← Deneme Sınavlarım
        </Link>
        <ExamResultView
          shareUrl={shareUrl}
          result={{
            attemptId: attempt.id,
            score: attempt.score ?? 0,
            total: attempt.total,
            language: attempt.language,
            review,
          }}
        />
      </div>
    );
  }

  // Doğru cevaplar bilerek seçilmiyor — sınav bitmeden istemciye gitmemeli.
  const rows = await prisma.examQuestion.findMany({
    where: { id: { in: questionIds } },
    select: {
      id: true,
      prompt: true,
      optionA: true,
      optionB: true,
      optionC: true,
      optionD: true,
    },
  });
  const byId = new Map(rows.map((r) => [r.id, r]));
  const questions = questionIds.flatMap((qid) => {
    const q = byId.get(qid);
    return q ? [q] : [];
  });

  const deadline = attempt.startedAt.getTime() + EXAM_MINUTES * 60_000;
  const remainingMs = deadline - new Date().getTime();

  return (
    <ExamRunner
      attemptId={attempt.id}
      language={attempt.language}
      questions={questions}
      remainingMs={remainingMs}
      shareUrl={shareUrl}
    />
  );
}
