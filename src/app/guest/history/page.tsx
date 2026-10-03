import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getI18n } from "@/lib/i18n/server";
import { INTL_TAG } from "@/lib/i18n/config";
import { questionTitleLabel, subjectLabel } from "@/lib/i18n/subject";
import { tx } from "@/lib/i18n/translate";
import { EmptyState } from "@/components/EmptyState";

export default async function GuestHistoryPage() {
  const { locale, t } = await getI18n();
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
    PAID: t(tx("Ödendi")),
    PENDING: t(tx("Beklemede")),
    FAILED: t(tx("Başarısız")),
  };

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-semibold text-brand-950">{t("Geçmişim")}</h1>

      <section className="space-y-3">
        <h2 className="text-lg font-medium text-brand-950">
          {t("Kredi Satın Alımlarım")}
        </h2>
        <div className="overflow-x-auto rounded-xl border border-brand-100 bg-white transition-shadow duration-200 hover:shadow-md shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-slate-500">
                <th className="px-4 py-2 font-medium">{t("Paket")}</th>
                <th className="px-4 py-2 font-medium">{t("Kredi")}</th>
                <th className="px-4 py-2 font-medium">{t("Tutar")}</th>
                <th className="px-4 py-2 font-medium">{t("Durum")}</th>
                <th className="px-4 py-2 font-medium">{t("Tarih")}</th>
              </tr>
            </thead>
            <tbody>
              {purchases.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <EmptyState icon="coins" text={t("Henüz kredi satın almadınız.")} compact />
                  </td>
                </tr>
              )}
              {purchases.map((p) => (
                <tr key={p.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-2 text-slate-900">{p.package.name}</td>
                  <td className="px-4 py-2 text-slate-600">{p.credits}</td>
                  <td className="px-4 py-2 text-slate-600">
                    {Number(p.amount).toLocaleString(INTL_TAG[locale], {
                      style: "currency",
                      currency: "TRY",
                    })}
                  </td>
                  <td className="px-4 py-2 text-slate-600">
                    {statusLabel[p.status] ?? p.status}
                  </td>
                  <td className="px-4 py-2 text-slate-500">
                    {p.createdAt.toLocaleString(INTL_TAG[locale])}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium text-brand-950">{t("Açtığım Sorular")}</h2>
        <div className="overflow-x-auto rounded-xl border border-brand-100 bg-white transition-shadow duration-200 hover:shadow-md shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-slate-500">
                <th className="px-4 py-2 font-medium">{t("Soru adı")}</th>
                <th className="px-4 py-2 font-medium">{t("Konu")}</th>
                <th className="px-4 py-2 font-medium">{t("Kredi")}</th>
                <th className="px-4 py-2 font-medium">{t("Açılma Tarihi")}</th>
                <th className="px-4 py-2 font-medium"></th>
              </tr>
            </thead>
            <tbody>
              {unlocks.length === 0 && (
                <tr>
                  <td colSpan={5}>
                    <EmptyState icon="book" text={t("Henüz soru açmadınız.")} compact />
                  </td>
                </tr>
              )}
              {unlocks.map((u) => (
                <tr key={u.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-2 text-slate-900">{questionTitleLabel(u.question.title, t)}</td>
                  <td className="px-4 py-2 text-slate-600">{subjectLabel(u.question.subject, t)}</td>
                  <td className="px-4 py-2 text-slate-600">
                    {u.question.creditCost}
                  </td>
                  <td className="px-4 py-2 text-slate-500">
                    {u.unlockedAt.toLocaleString(INTL_TAG[locale])}
                  </td>
                  <td className="px-4 py-2">
                    <Link
                      href={`/guest/questions/${u.questionId}`}
                      className="text-brand-600 underline hover:text-brand-800"
                    >
                      {t("Görüntüle")}
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
