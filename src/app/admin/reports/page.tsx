import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { timeAgoTr } from "@/lib/activity";
import { ReportActions } from "./ReportActions";

type Snapshot = {
  prompt: string;
  options: string[];
  correct: string;
  source: string;
  questionId?: string;
};

export default async function AdminReportsPage() {
  const reports = await prisma.questionReport.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: { select: { name: true } } },
    take: 300,
  });

  // Aynı soruya gelen bildirimler tek kartta toplanır.
  const groups = new Map<string, typeof reports>();
  for (const report of reports) {
    const key = `${report.kind}:${report.itemId}`;
    groups.set(key, [...(groups.get(key) ?? []), report]);
  }
  const cards = [...groups.values()].map((list) => ({
    list,
    open: list.some((r) => r.status === "OPEN"),
    latest: list[0].createdAt,
  }));
  cards.sort((a, b) => Number(b.open) - Number(a.open) || b.latest.getTime() - a.latest.getTime());
  const openCount = cards.filter((c) => c.open).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Soru Bildirimleri</h1>
        <p className="text-sm text-slate-500">
          Öğrencilerin hatalı veya belirsiz bulduğu sorular. {openCount} soru inceleme bekliyor.
        </p>
      </div>

      {cards.length === 0 && (
        <div className="rounded-xl border border-dashed border-brand-200 p-8 text-center text-sm text-slate-500">
          Henüz soru bildirimi yok. Öğrenciler çözdükleri bir sorunun altındaki “🚩 Soruyu bildir”
          bağlantısını kullanınca burada görünür.
        </div>
      )}

      {cards.map(({ list, open }) => {
        const first = list[0];
        const snap = first.snapshot as unknown as Snapshot;
        return (
          <div
            key={`${first.kind}:${first.itemId}`}
            className={`space-y-3 rounded-xl border bg-white p-5 shadow-sm ${
              open ? "border-red-200" : "border-slate-200 opacity-70"
            }`}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs text-slate-400">{snap.source}</p>
                <p className="mt-1 font-medium text-slate-900">{snap.prompt}</p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${
                  open ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
                }`}
              >
                {open ? `${list.filter((r) => r.status === "OPEN").length} bildirim` : "Çözüldü"}
              </span>
            </div>

            <ul className="space-y-1 text-sm">
              {snap.options.map((option, i) => (
                <li
                  key={i}
                  className={
                    "ABCD"[i] === snap.correct ? "font-medium text-green-700" : "text-slate-600"
                  }
                >
                  {"ABCD"[i]}) {option}
                  {"ABCD"[i] === snap.correct && "  ← işaretli doğru cevap"}
                </li>
              ))}
            </ul>

            <ul className="space-y-1 border-t border-slate-100 pt-3 text-sm">
              {list.map((r) => (
                <li key={r.id} className="text-slate-700">
                  <span className="font-medium">{r.user.name}</span>
                  <span className="text-slate-400"> · {timeAgoTr(r.createdAt)} · </span>
                  {r.reason}
                  {r.note && <span className="text-slate-500"> — “{r.note}”</span>}
                </li>
              ))}
            </ul>

            <div className="flex flex-wrap items-center justify-between gap-3">
              {first.kind === "quiz" && snap.questionId ? (
                <Link
                  href={`/admin/questions/${snap.questionId}/quiz`}
                  className="text-sm text-brand-600 underline hover:text-brand-800"
                >
                  Soruyu düzenle →
                </Link>
              ) : (
                <span className="text-xs text-slate-400">
                  Deneme havuzu sorusu (düzenlemek için Claude&apos;a söyleyin)
                </span>
              )}
              <ReportActions kind={first.kind} itemId={first.itemId} open={open} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
