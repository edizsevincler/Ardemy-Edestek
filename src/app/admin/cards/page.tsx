import { prisma } from "@/lib/prisma";
import { daysAgo } from "@/lib/ranking";
import { WordForm } from "./WordForm";
import { DeleteWordButton } from "./DeleteWordButton";

const LIMIT = 200;

export default async function AdminCardsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;
  const query = q.trim();
  const where = query
    ? {
        OR: [
          { front: { contains: query, mode: "insensitive" as const } },
          { back: { contains: query, mode: "insensitive" as const } },
        ],
      }
    : {};

  const weekAgo = daysAgo(7);
  const [words, total, learners, reviewsWeek] = await Promise.all([
    prisma.cardWord.findMany({ where, orderBy: { createdAt: "desc" }, take: LIMIT }),
    prisma.cardWord.count(),
    prisma.flashCard.groupBy({ by: ["userId"] }).then((rows) => rows.length),
    prisma.cardReview.count({ where: { createdAt: { gte: weekAgo } } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Kelime Kartları</h1>
        <p className="text-sm text-slate-500">
          Eklediğin kelimeler kullanıcıların kaydırmalı kart destesine girer. Toplam {total} kelime, {learners} kullanıcının
          kartı var, son 7 günde {reviewsWeek} kart çalışıldı.
        </p>
      </div>

      <WordForm />

      <div className="rounded-lg border border-slate-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-medium text-slate-900">Kelimeler</h2>
          <form className="flex gap-2" action="/admin/cards">
            <input
              name="q"
              defaultValue={query}
              placeholder="Ara..."
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-slate-500"
            />
            <button className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50">
              Ara
            </button>
          </form>
        </div>

        {words.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">{query ? "Eşleşen kelime yok." : "Henüz kelime eklenmedi."}</p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-xs uppercase text-slate-500">
                <tr>
                  <th className="py-2 pr-4">Ön (Türkçe)</th>
                  <th className="py-2 pr-4">Arka (yabancı)</th>
                  <th className="py-2 pr-4">Dil</th>
                  <th className="py-2 pr-4">Tarih</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {words.map((w) => (
                  <tr key={w.id}>
                    <td className="py-2 pr-4 font-medium text-slate-900">{w.front}</td>
                    <td className="py-2 pr-4 text-slate-700">{w.back}</td>
                    <td className="py-2 pr-4 text-slate-500">{w.language === "RU" ? "Rusça" : "İngilizce"}</td>
                    <td className="py-2 pr-4 text-slate-500">{w.createdAt.toLocaleDateString("tr-TR")}</td>
                    <td className="py-2 text-right">
                      <DeleteWordButton id={w.id} label={`${w.front} = ${w.back}`} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {total > words.length && !query && (
          <p className="mt-3 text-xs text-slate-500">En yeni {LIMIT} kelime gösteriliyor. Diğerlerini aramayla bulabilirsin.</p>
        )}
      </div>
    </div>
  );
}
