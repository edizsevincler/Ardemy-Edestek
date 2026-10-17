import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { AddWrittenItemForm, EditWrittenItemForm, WrittenPagesManager } from "./WrittenItemForms";

export default async function WrittenItemsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const question = await prisma.question.findUnique({
    where: { id },
    include: {
      writtenItems: { orderBy: { order: "asc" } },
      _count: { select: { writtenSubmissions: true } },
    },
  });
  if (!question || question.type !== "WRITTEN") notFound();

  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/questions" className="text-sm text-slate-500 hover:text-brand-700">
          ← Soru Bankası
        </Link>
        <h1 className="text-2xl font-semibold text-brand-950">{question.title} — Yazılı Sorular</h1>
        <p className="text-sm text-slate-500">
          {question.subject} · {question.writtenItems.length} soru ·{" "}
          <Link href={`/admin/questions/${id}/answers`} className="text-brand-600 underline">
            {question._count.writtenSubmissions} öğrenci cevabı
          </Link>
          {question.isPublished ? "" : " · Taslak (öğrenciler göremez)"}
        </p>
      </div>

      <WrittenPagesManager questionId={id} pageCount={question.pageImages.length} />

      <div className="space-y-3">
        {question.writtenItems.length === 0 ? (
          <p className="text-sm text-slate-500">Henüz soru eklenmedi.</p>
        ) : (
          question.writtenItems.map((item) => (
            <EditWrittenItemForm key={item.id} item={item} pageCount={question.pageImages.length} />
          ))
        )}
      </div>

      <AddWrittenItemForm questionId={id} pageCount={question.pageImages.length} />
    </div>
  );
}
