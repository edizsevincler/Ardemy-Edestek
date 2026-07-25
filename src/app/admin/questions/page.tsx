import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { QuestionForm } from "./QuestionForm";
import { DeleteButton } from "./DeleteButton";

export default async function AdminQuestionsPage() {
  const questions = await prisma.question.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { unlocks: true, answers: true } } },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-brand-950">Soru Bankası</h1>

      <QuestionForm />

      <div className="overflow-x-auto rounded-xl border border-brand-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-slate-500">
              <th className="px-4 py-2 font-medium">Tür</th>
              <th className="px-4 py-2 font-medium">Başlık</th>
              <th className="px-4 py-2 font-medium">Konu</th>
              <th className="px-4 py-2 font-medium">Kredi</th>
              <th className="px-4 py-2 font-medium">Durum</th>
              <th className="px-4 py-2 font-medium">Açan</th>
              <th className="px-4 py-2 font-medium">Cevaplar</th>
              <th className="px-4 py-2 font-medium">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {questions.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-slate-400">
                  Henüz soru eklenmedi.
                </td>
              </tr>
            )}
            {questions.map((q) => (
              <tr key={q.id} className="border-b border-slate-50 last:border-0">
                <td className="px-4 py-2 text-slate-600">
                  {q.type === "TOPIC" ? "Konu Anlatımı" : "Soru"}
                </td>
                <td className="px-4 py-2 text-slate-900">{q.title}</td>
                <td className="px-4 py-2 text-slate-600">{q.subject}</td>
                <td className="px-4 py-2 text-slate-600">{q.creditCost}</td>
                <td className="px-4 py-2">
                  {q.isPublished ? (
                    <span className="text-emerald-600">Yayında</span>
                  ) : (
                    <span className="text-slate-400">Taslak</span>
                  )}
                </td>
                <td className="px-4 py-2 text-slate-600">
                  {q._count.unlocks}
                </td>
                <td className="px-4 py-2">
                  <Link
                    href={`/admin/questions/${q.id}/answers`}
                    className="text-brand-600 underline hover:text-brand-800"
                  >
                    {q._count.answers} cevap
                  </Link>
                </td>
                <td className="px-4 py-2 space-x-3">
                  <Link
                    href={`/admin/questions/${q.id}/edit`}
                    className="text-slate-600 underline hover:text-slate-900"
                  >
                    Düzenle
                  </Link>
                  <DeleteButton id={q.id} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
