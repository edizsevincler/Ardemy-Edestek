import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { SubmissionCard, type WrittenAnswer } from "./SubmissionCard";

const LIMIT = 100;

// Tüm yazılı test (ör. Biyoloji) gönderimleri, en yeni önce.
export default async function WrittenAnswersPage({
  searchParams,
}: {
  searchParams: Promise<{ filtre?: string }>;
}) {
  const { filtre } = await searchParams;
  const pendingOnly = filtre !== "tumu";

  const [submissions, pendingCount, totalCount] = await Promise.all([
    prisma.writtenSubmission.findMany({
      where: pendingOnly ? { feedback: null } : {},
      orderBy: { submittedAt: "desc" },
      take: LIMIT,
      include: {
        user: { select: { name: true, email: true, username: true, role: true } },
        question: {
          select: {
            id: true,
            title: true,
            subject: true,
            writtenItems: { orderBy: { order: "asc" }, select: { id: true, order: true, prompt: true, answer: true } },
          },
        },
      },
    }),
    prisma.writtenSubmission.count({ where: { feedback: null } }),
    prisma.writtenSubmission.count(),
  ]);

  const tab = (active: boolean) =>
    `rounded-full px-4 py-1.5 text-sm font-medium ${
      active ? "bg-brand-600 text-white" : "border border-brand-200 bg-white text-brand-700 hover:bg-brand-50"
    }`;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-brand-950">Yazılı Cevaplar</h1>
        <p className="text-sm text-slate-500">
          Öğrencilerin yazılı testlere (ör. Biyoloji) verdiği cevaplar. Toplam {totalCount} gönderim, {pendingCount} tanesi
          geri bildirim bekliyor.
        </p>
      </div>

      <div className="flex gap-2">
        <Link href="/admin/written-answers" className={tab(pendingOnly)}>
          Geri bildirim bekleyenler ({pendingCount})
        </Link>
        <Link href="/admin/written-answers?filtre=tumu" className={tab(!pendingOnly)}>
          Tümü ({totalCount})
        </Link>
      </div>

      {submissions.length === 0 ? (
        <p className="text-sm text-slate-500">
          {pendingOnly ? "Geri bildirim bekleyen cevap yok." : "Henüz yazılı test cevabı gönderilmedi."}
        </p>
      ) : (
        <div className="space-y-4">
          {submissions.map((s) => (
            <SubmissionCard
              key={s.id}
              items={s.question.writtenItems}
              submission={{ ...s, answers: s.answers as WrittenAnswer[], question: s.question }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
