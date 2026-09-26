import { prisma } from "@/lib/prisma";
import { REFERRAL_REWARD_CREDITS } from "@/lib/referral";

export default async function AdminReferralsPage() {
  const referred = await prisma.user.findMany({
    where: { referredById: { not: null } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      role: true,
      createdAt: true,
      referralRewardGiven: true,
      referredBy: { select: { name: true } },
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-brand-950">
        🎁 Arkadaşını Getir
      </h1>
      <p className="text-sm text-slate-500">
        Bir referans linkiyle katılan kullanıcının ilk kredi alışverişi
        onaylandığında hem davet edene hem davet edilene otomatik{" "}
        {REFERRAL_REWARD_CREDITS} kredi eklenir — burada elle bir işlem
        yapmanız gerekmez, sadece takip için.
      </p>

      {referred.length === 0 ? (
        <p className="text-sm text-slate-500">
          Henüz kimse bir referans linkiyle katılmadı.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-brand-100 bg-white transition-shadow duration-200 hover:shadow-md shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-slate-500">
                <th className="px-4 py-2 font-medium">Davet Edilen</th>
                <th className="px-4 py-2 font-medium">Davet Eden</th>
                <th className="px-4 py-2 font-medium">Katılma Tarihi</th>
                <th className="px-4 py-2 font-medium">Ödül</th>
              </tr>
            </thead>
            <tbody>
              {referred.map((u) => (
                <tr key={u.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-2 text-slate-900">
                    {u.name}{" "}
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-normal text-slate-500">
                      {u.role === "STUDENT" ? "Öğrenci" : "Misafir"}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-slate-600">
                    {u.referredBy?.name ?? "—"}
                  </td>
                  <td className="px-4 py-2 text-slate-500">
                    {u.createdAt.toLocaleDateString("tr-TR")}
                  </td>
                  <td className="px-4 py-2">
                    {u.referralRewardGiven ? (
                      <span className="text-emerald-700">Verildi ✓</span>
                    ) : (
                      <span className="text-slate-400">Bekliyor</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
