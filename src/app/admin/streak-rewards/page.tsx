import { prisma } from "@/lib/prisma";
import { RewardActions } from "./RewardActions";

export default async function StreakRewardsPage() {
  const rewards = await prisma.streakReward.findMany({
    orderBy: [{ fulfilled: "asc" }, { createdAt: "desc" }],
    include: {
      user: { select: { name: true, username: true, email: true, role: true } },
    },
  });

  const pending = rewards.filter((r) => !r.fulfilled);
  const fulfilled = rewards.filter((r) => r.fulfilled);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-brand-950">
        Seri (Streak) Ödülleri
      </h1>
      <p className="text-sm text-slate-500">
        Bir kullanıcı 30 günün katı bir çalışma serisine ulaştığında burada
        listelenir. Ödülü (ör. 40 dakikalık hediye ders) elden verdikten
        sonra &quot;Verildi&quot; olarak işaretleyin.
      </p>

      {pending.length === 0 ? (
        <p className="text-sm text-slate-500">Bekleyen bir ödül yok.</p>
      ) : (
        <div className="space-y-3">
          {pending.map((r) => (
            <div
              key={r.id}
              className="flex flex-col gap-3 rounded-xl border border-brand-100 bg-white transition-shadow duration-200 hover:shadow-md p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-brand-950">
                  {r.user.name}{" "}
                  <span className="font-normal text-slate-400">
                    ({r.user.email ?? r.user.username})
                  </span>{" "}
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-normal text-slate-500">
                    {r.user.role === "STUDENT" ? "Öğrenci" : "Misafir"}
                  </span>
                </p>
                <p className="text-sm text-slate-600">
                  🔥 {r.streakDays} günlük seri
                </p>
                <p className="text-xs text-slate-400">
                  {r.createdAt.toLocaleString("tr-TR")}
                </p>
              </div>
              <RewardActions rewardId={r.id} userName={r.user.name} />
            </div>
          ))}
        </div>
      )}

      {fulfilled.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-medium text-brand-950">
            Verilmiş Ödüller
          </h2>
          <div className="space-y-2">
            {fulfilled.map((r) => (
              <div
                key={r.id}
                className="flex flex-col gap-1 rounded-xl border border-slate-100 bg-white/60 p-4 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between"
              >
                <p>
                  <span className="font-medium text-slate-700">
                    {r.user.name}
                  </span>{" "}
                  — 🔥 {r.streakDays} günlük seri
                </p>
                <p className="text-xs text-slate-400">
                  {r.fulfilledAt?.toLocaleString("tr-TR")}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
