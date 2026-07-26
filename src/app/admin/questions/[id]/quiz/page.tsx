import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { QuizItemEditForm } from "./QuizItemEditForm";

export default async function AdminQuizItemsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const question = await prisma.question.findUnique({ where: { id } });
  if (!question || question.type !== "QUIZ") {
    notFound();
  }

  const items = await prisma.quizItem.findMany({
    where: { questionId: id },
    orderBy: { order: "asc" },
  });

  return (
    <div className="space-y-4">
      <Link
        href="/admin/questions"
        className="text-sm text-slate-500 hover:text-brand-700"
      >
        ← Soru Bankası
      </Link>
      <h1 className="text-2xl font-semibold text-brand-950">
        {question.title} — Test Soruları
      </h1>
      <p className="text-sm text-slate-500">{items.length} soru</p>

      <div className="space-y-3">
        {items.map((item) => (
          <QuizItemEditForm key={item.id} item={item} questionId={id} />
        ))}
      </div>
    </div>
  );
}
