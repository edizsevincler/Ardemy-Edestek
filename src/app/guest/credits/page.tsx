import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PackageCard } from "./PackageCard";
import { PAYMENT_TEST_MODE } from "@/lib/payment";

export default async function GuestCreditsPage() {
  const session = await auth();

  const [packages, me] = await Promise.all([
    prisma.creditPackage.findMany({
      where: { isActive: true },
      orderBy: { credits: "asc" },
    }),
    prisma.user.findUnique({
      where: { id: session!.user.id },
      select: { credits: true },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-brand-950">
          Kredi Satın Al
        </h1>
        <div className="rounded-lg border border-brand-100 bg-white px-4 py-2 text-sm">
          <span className="text-slate-500">Bakiyeniz: </span>
          <span className="font-medium text-brand-950">{me?.credits ?? 0} kredi</span>
        </div>
      </div>

      {PAYMENT_TEST_MODE && (
        <div className="rounded-lg border border-gold-400 bg-gold-50 px-4 py-3 text-sm text-gold-600">
          <strong>Test Modu:</strong> Ödeme sistemi henüz gerçek para almıyor,
          "satın alma" işlemleri anında kredi olarak yansır.
        </div>
      )}

      {packages.length === 0 ? (
        <p className="text-sm text-slate-500">
          Şu anda satışta paket bulunmuyor.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-3">
          {packages.map((p) => (
            <PackageCard
              key={p.id}
              id={p.id}
              name={p.name}
              credits={p.credits}
              priceTRY={Number(p.priceTRY)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
