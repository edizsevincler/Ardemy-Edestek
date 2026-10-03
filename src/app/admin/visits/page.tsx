import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { dateKey } from "@/lib/streak";
import { sourceLabel } from "@/lib/source";

const DAY_MS = 86_400_000;

const PAGE_LABELS: Record<string, string> = {
  "/": "Ana sayfa",
  "/login": "Giriş",
  "/register": "Kayıt",
  "/link": "Bio link (/link)",
  "/dene": "Ücretsiz testler (liste)",
  "/dene/rusca": "Ücretsiz Rusça testi",
  "/dene/ingilizce": "Ücretsiz İngilizce testi",
  "/rusca-alfabe": "Rusça alfabe",
  "/gizlilik-politikasi": "Gizlilik Politikası",
  "/mesafeli-satis-sozlesmesi": "Mesafeli Satış Sözleşmesi",
};

export default async function AdminVisitsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const params = await searchParams;
  const days = params.days === "7" ? 7 : params.days === "90" ? 90 : 30;
  const from = dateKey(new Date(new Date().getTime() - (days - 1) * DAY_MS));

  const where = { day: { gte: from } };
  const [byPath, bySource, byDay, byLocale] = await Promise.all([
    prisma.pageViewDaily.groupBy({ by: ["path"], where, _sum: { count: true } }),
    prisma.pageViewDaily.groupBy({ by: ["source"], where, _sum: { count: true } }),
    prisma.pageViewDaily.groupBy({ by: ["day"], where, _sum: { count: true } }),
    prisma.pageViewDaily.groupBy({ by: ["locale"], where, _sum: { count: true } }),
  ]);

  const total = byPath.reduce((s, r) => s + (r._sum.count ?? 0), 0);
  const sorted = <T extends { _sum: { count: number | null } }>(rows: T[]) =>
    [...rows].sort((a, b) => (b._sum.count ?? 0) - (a._sum.count ?? 0));
  const maxDay = Math.max(1, ...byDay.map((r) => r._sum.count ?? 0));

  const tabs = [
    { label: "Son 7 gün", value: "7" },
    { label: "Son 30 gün", value: "30" },
    { label: "Son 90 gün", value: "90" },
  ];

  const renderTable = (
    title: string,
    rows: { name: string; count: number }[]
  ) => (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <p className="border-b border-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
        {title}
      </p>
      <table className="w-full text-sm">
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td className="px-4 py-4 text-center text-slate-400">Veri yok.</td>
            </tr>
          )}
          {rows.map((r) => (
            <tr key={r.name} className="border-b border-slate-50 last:border-0">
              <td className="px-4 py-1.5 text-slate-800">{r.name}</td>
              <td className="px-4 py-1.5 text-right font-medium text-slate-900">
                {r.count}
              </td>
              <td className="w-16 px-4 py-1.5 text-right text-xs text-slate-400">
                %{Math.round((r.count / Math.max(total, 1)) * 100)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">📈 Ziyaretler</h1>
        <p className="mt-1 text-sm text-slate-500">
          Herkese açık sayfaların görüntülenme sayısı (giriş yapılan paneller ve
          botlar sayılmaz). Kişi veya cihaz bilgisi tutulmaz; yalnızca toplam
          sayılar saklanır. Aynı kişi birden fazla kez görüntüleyebilir, yani
          bunlar ziyaretçi değil sayfa görüntüleme sayısıdır.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {tabs.map((t) => (
          <Link
            key={t.value}
            href={`/admin/visits?days=${t.value}`}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              String(days) === t.value
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {t.label}
          </Link>
        ))}
        <span className="ml-2 text-sm text-slate-500">
          Toplam: <strong className="text-slate-900">{total}</strong> görüntüleme
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {renderTable("Sayfalara göre", sorted(byPath).map((r) => ({
            name: PAGE_LABELS[r.path] ?? r.path,
            count: r._sum.count ?? 0,
          })))}
        {renderTable("Kaynağa göre (?src= etiketi)", sorted(bySource).map((r) => ({
            name: sourceLabel(r.source || null),
            count: r._sum.count ?? 0,
          })))}
        {renderTable("Dile göre", sorted(byLocale).map((r) => ({
            name: { tr: "Türkçe", en: "İngilizce", ru: "Rusça" }[r.locale] ?? r.locale,
            count: r._sum.count ?? 0,
          })))}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <p className="border-b border-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
            Günlere göre
          </p>
          <div className="max-h-72 space-y-1 overflow-y-auto p-4">
            {byDay.length === 0 && (
              <p className="text-center text-sm text-slate-400">Veri yok.</p>
            )}
            {[...byDay]
              .sort((a, b) => b.day.localeCompare(a.day))
              .map((r) => {
                const count = r._sum.count ?? 0;
                return (
                  <div key={r.day} className="flex items-center gap-2 text-xs">
                    <span className="w-20 shrink-0 text-slate-500">{r.day}</span>
                    <div className="h-3 flex-1 overflow-hidden rounded bg-slate-100">
                      <div
                        className="h-full rounded bg-brand-500"
                        style={{ width: `${(count / maxDay) * 100}%` }}
                      />
                    </div>
                    <span className="w-10 shrink-0 text-right font-medium text-slate-800">
                      {count}
                    </span>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
}
