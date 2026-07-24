import { prisma } from "@/lib/prisma";
import { PaymentActions } from "./PaymentActions";

export default async function PendingPaymentsPage() {
  const pending = await prisma.creditPurchase.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    include: {
      user: { select: { name: true, username: true, email: true, role: true } },
      package: { select: { name: true } },
    },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-brand-950">
        Bekleyen Ödemeler
      </h1>
      <p className="text-sm text-slate-500">
        Havale/EFT dekontunu gördükten sonra buradan onaylayın; kredi
        hesaba otomatik işlenir.
      </p>

      {pending.length === 0 ? (
        <p className="text-sm text-slate-500">
          Bekleyen bir ödeme talebi yok.
        </p>
      ) : (
        <div className="space-y-3">
          {pending.map((p) => (
            <div
              key={p.id}
              className="flex flex-col gap-3 rounded-xl border border-brand-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium text-brand-950">
                  {p.user.name}{" "}
                  <span className="font-normal text-slate-400">
                    ({p.user.email ?? p.user.username})
                  </span>{" "}
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-normal text-slate-500">
                    {p.user.role === "STUDENT" ? "Öğrenci" : "Misafir"}
                  </span>
                </p>
                <p className="text-sm text-slate-600">
                  {p.package.name} — {p.credits} kredi —{" "}
                  {Number(p.amount).toLocaleString("tr-TR", {
                    style: "currency",
                    currency: "TRY",
                  })}
                </p>
                <p className="text-xs text-slate-400">
                  {p.createdAt.toLocaleString("tr-TR")}
                </p>
              </div>
              <PaymentActions
                purchaseId={p.id}
                userName={p.user.name}
                credits={p.credits}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
