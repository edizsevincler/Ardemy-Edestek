import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { sourceLabel } from "@/lib/source";

const DAY_MS = 86_400_000;

export default async function AdminSourcesPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const params = await searchParams;
  const days = params.days === "7" ? 7 : params.days === "all" ? null : 30;
  const since = days ? new Date(new Date().getTime() - days * DAY_MS) : null;

  const users = await prisma.user.findMany({
    where: {
      role: "GUEST",
      ...(since ? { createdAt: { gte: since } } : {}),
    },
    select: {
      id: true,
      signupSource: true,
      emailVerified: true,
      creditPurchases: { where: { status: "PAID" }, select: { id: true } },
    },
  });

  const rows = new Map<
    string,
    { source: string | null; signups: number; verified: number; buyers: number }
  >();
  for (const u of users) {
    const key = u.signupSource ?? "";
    const row = rows.get(key) ?? {
      source: u.signupSource,
      signups: 0,
      verified: 0,
      buyers: 0,
    };
    row.signups++;
    if (u.emailVerified) row.verified++;
    if (u.creditPurchases.length > 0) row.buyers++;
    rows.set(key, row);
  }
  const list = [...rows.values()].sort((a, b) => b.signups - a.signups);
  const total = users.length;

  const tabs = [
    { label: "Son 7 gün", value: "7" },
    { label: "Son 30 gün", value: "30" },
    { label: "Tümü", value: "all" },
  ];
  const active = days === 7 ? "7" : days === 30 ? "30" : "all";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">
          📊 Kayıt Kaynakları
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Kayıt olan misafirlerin hangi bağlantıdan geldiği. Bağlantı sonuna{" "}
          <code className="rounded bg-slate-100 px-1">?src=instagram</code> gibi
          bir etiket eklenmişse kaynağı burada görünür.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {tabs.map((t) => (
          <Link
            key={t.value}
            href={`/admin/sources?days=${t.value}`}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
              active === t.value
                ? "border-brand-600 bg-brand-600 text-white"
                : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-slate-500">
              <th className="px-4 py-2 font-medium">Kaynak</th>
              <th className="px-4 py-2 font-medium">Kayıt</th>
              <th className="px-4 py-2 font-medium">Pay</th>
              <th className="px-4 py-2 font-medium">E-posta onaylayan</th>
              <th className="px-4 py-2 font-medium">Kredi satın alan</th>
            </tr>
          </thead>
          <tbody>
            {list.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                  Bu dönemde kayıt yok.
                </td>
              </tr>
            )}
            {list.map((r) => (
              <tr
                key={r.source ?? "none"}
                className="border-b border-slate-50 last:border-0"
              >
                <td className="px-4 py-2 font-medium text-slate-900">
                  {sourceLabel(r.source)}
                </td>
                <td className="px-4 py-2 text-slate-900">{r.signups}</td>
                <td className="px-4 py-2 text-slate-500">
                  %{Math.round((r.signups / Math.max(total, 1)) * 100)}
                </td>
                <td className="px-4 py-2 text-slate-600">{r.verified}</td>
                <td className="px-4 py-2 text-slate-600">{r.buyers}</td>
              </tr>
            ))}
          </tbody>
          {list.length > 0 && (
            <tfoot>
              <tr className="border-t border-slate-200 font-medium text-slate-900">
                <td className="px-4 py-2">Toplam</td>
                <td className="px-4 py-2">{total}</td>
                <td className="px-4 py-2" />
                <td className="px-4 py-2">
                  {list.reduce((s, r) => s + r.verified, 0)}
                </td>
                <td className="px-4 py-2">
                  {list.reduce((s, r) => s + r.buyers, 0)}
                </td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
        <p className="font-medium text-slate-900">Kullanacağın bağlantılar</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>
            Instagram profil linki: <code>/link?src=instagram</code>
          </li>
          <li>
            TikTok profil linki: <code>/link?src=tiktok</code>
          </li>
          <li>
            WhatsApp kanalı: <code>/link?src=whatsapp</code>
          </li>
          <li>
            Instagram hikâye linki: <code>/dene?src=instagram-story</code>
          </li>
          <li>
            Reklam: <code>/dene/rusca?src=instagram-reklam</code>
          </li>
        </ul>
        <p className="mt-2 text-xs text-slate-400">
          Başına sitenin adresini ekle (ardemy-edestek.vercel.app). Yalnızca
          kayıtlar izlenir; link tıklamalarını Instagram Insights gösterir.
        </p>
      </div>
    </div>
  );
}
