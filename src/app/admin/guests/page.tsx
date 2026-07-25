import { prisma } from "@/lib/prisma";
import { ResetPasswordButton } from "./ResetPasswordButton";

export default async function AdminGuestsPage() {
  const guests = await prisma.user.findMany({
    where: { role: "GUEST" },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-brand-950">Misafirler</h1>

      <div className="overflow-x-auto rounded-xl border border-brand-100 bg-white transition-shadow duration-200 hover:shadow-md shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-slate-500">
              <th className="px-4 py-2 font-medium">Ad Soyad</th>
              <th className="px-4 py-2 font-medium">E-posta</th>
              <th className="px-4 py-2 font-medium">Kredi</th>
              <th className="px-4 py-2 font-medium">Kayıt Tarihi</th>
              <th className="px-4 py-2 font-medium">Son Giriş</th>
              <th className="px-4 py-2 font-medium">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {guests.length === 0 && (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-slate-400">
                  Henüz misafir kaydı yok.
                </td>
              </tr>
            )}
            {guests.map((g) => (
              <tr key={g.id} className="border-b border-slate-50 last:border-0">
                <td className="px-4 py-2 text-slate-900">{g.name}</td>
                <td className="px-4 py-2 text-slate-600">{g.email}</td>
                <td className="px-4 py-2 text-slate-600">{g.credits}</td>
                <td className="px-4 py-2 text-slate-500">
                  {g.createdAt.toLocaleDateString("tr-TR")}
                </td>
                <td className="px-4 py-2 text-slate-500">
                  {g.lastLoginAt
                    ? g.lastLoginAt.toLocaleString("tr-TR")
                    : "Henüz giriş yapmadı"}
                </td>
                <td className="px-4 py-2">
                  <ResetPasswordButton userId={g.id} userName={g.name} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
