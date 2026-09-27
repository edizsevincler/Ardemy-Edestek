import { prisma } from "@/lib/prisma";

const INACTIVE_DAYS = 30;

export default async function InactiveUsersPage() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - INACTIVE_DAYS);

  const users = await prisma.user.findMany({
    where: {
      role: { in: ["STUDENT", "GUEST"] },
      OR: [{ lastLoginAt: null }, { lastLoginAt: { lt: cutoff } }],
    },
    orderBy: [{ lastLoginAt: { sort: "asc", nulls: "first" } }],
    select: {
      id: true,
      name: true,
      role: true,
      username: true,
      email: true,
      lastLoginAt: true,
      createdAt: true,
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-brand-950">
        Pasif Kullanıcılar
      </h1>
      <p className="text-sm text-slate-500">
        Son {INACTIVE_DAYS} gündür hiç giriş yapmamış (veya hiç giriş
        yapmamış) öğrenci ve misafirler — geri kazanmak için elden
        WhatsApp/mesaj atmak isteyebileceğiniz kişiler.
      </p>

      {users.length === 0 ? (
        <p className="text-sm text-slate-500">
          Şu anda pasif sayılan kimse yok.
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-brand-100 bg-white transition-shadow duration-200 hover:shadow-md shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-slate-500">
                <th className="px-4 py-2 font-medium">Ad Soyad</th>
                <th className="px-4 py-2 font-medium">Tür</th>
                <th className="px-4 py-2 font-medium">Kullanıcı Adı / E-posta</th>
                <th className="px-4 py-2 font-medium">Son Giriş</th>
                <th className="px-4 py-2 font-medium">Kayıt Tarihi</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-slate-50 last:border-0">
                  <td className="px-4 py-2 text-slate-900">{u.name}</td>
                  <td className="px-4 py-2">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-500">
                      {u.role === "STUDENT" ? "Öğrenci" : "Misafir"}
                    </span>
                  </td>
                  <td className="px-4 py-2 font-mono text-slate-600">
                    {u.username ?? u.email ?? "—"}
                  </td>
                  <td className="px-4 py-2 text-slate-500">
                    {u.lastLoginAt
                      ? u.lastLoginAt.toLocaleDateString("tr-TR")
                      : "Hiç giriş yapmadı"}
                  </td>
                  <td className="px-4 py-2 text-slate-400">
                    {u.createdAt.toLocaleDateString("tr-TR")}
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
