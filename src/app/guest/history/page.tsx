import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export default async function GuestHistoryPage() {
  const session = await auth();
  const userId = session!.user.id;

  const [purchases, unlocks] = await Promise.all([
    prisma.creditPurchase.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      include: { package: { select: { name: true } } },
    }),
    prisma.questionUnlock.findMany({
      where: { userId },
      orderBy: { unlockedAt: "desc" },
      include: {
        question: { select: { title: true, subject: true, creditCost: true } },
      },
    }),
  ]);

  const statusLabel: Record<string, string> = {
    PAID: "Ödendi",
    PENDING: "Beklemede",
    FAILED: "Başarısız",
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-brand-950">Geçmişim</h1>

      <section className="space-y-3">
        <h2 className="text-lg font-medium text-brand-950">
          Kredi Satın Alımlarım
        </h2>
        <div className="overflow-x-auto rounded-xl border border-brand-100 bg-white transition-shadow duration-200 hover:shadow-md shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-slate-500">
                <th className="px-4 py-2 font-medium">Paket</th>
                <th className="px-4 py-2 font-medium">Kredi</th>
                <th className="px-4 py-2 font-medium">Tutar</th>
                <th className="px-4 py-2 font-medium">Durum</th>
                <th className="px-4 py-2 font-medium">Tarih</th>
              </tr>
            </thead>
            <tbody>
              {purchases.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                    Henüz kredi satın almadınız.
                  </td>
                </tr>
              )}
              {purchases.map((p) => (
                <tr key={p.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-2 text-slate-900">{p.package.name}</td>
                  <td className="px-4 py-2 text-slate-600">{p.credits}</td>
                  <td className="px-4 py-2 text-slate-600">
                    {Number(p.amount).toLocaleString("tr-TR", {
                      style: "currency",
                      currency: "TRY",
                    })}
                  </td>
                  <td className="px-4 py-2 text-slate-600">
                    {statusLabel[p.status] ?? p.status}
                  </td>
                  <td className="px-4 py-2 text-slate-500">
                    {p.createdAt.toLocaleString("tr-TR")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium text-brand-950">Açtığım Sorular</h2>
        <div className="overflow-x-auto rounded-xl border border-brand-100 bg-white transition-shadow duration-200 hover:shadow-md shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-slate-500">
                <th className="px-4 py-2 font-medium">Soru</th>
                <th className="px-4 py-2 font-medium">Konu</th>
                <th className="px-4 py-2 font-medium">Kredi</th>
                <th className="px-4 py-2 font-medium">Açılma Tarihi</th>
                <th className="px-4 py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {unlocks.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                    Henüz soru açmadınız.
                  </td>
                </tr>
              )}
              {unlocks.map((u) => (
                <tr key={u.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-2 text-slate-900">{u.question.title}</td>
                  <td className="px-4 py-2 text-slate-600">{u.question.subject}</td>
                  <td className="px-4 py-2 text-slate-600">
                    {u.question.creditCost}
                  </td>
                  <td className="px-4 py-2 text-slate-500">
                    {u.unlockedAt.toLocaleString("tr-TR")}
                  </td>
                  <td className="px-4 py-2">
                    <Link
                      href={`/guest/questions/${u.questionId}`}
                      className="text-brand-600 underline hover:text-brand-800"
                    >
                      Görüntüle
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
