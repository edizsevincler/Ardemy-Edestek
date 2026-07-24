import { prisma } from "@/lib/prisma";
import { PackageForm } from "./PackageForm";
import { ToggleActiveButton } from "./ToggleActiveButton";

export default async function CreditPackagesPage() {
  const packages = await prisma.creditPackage.findMany({
    orderBy: { credits: "asc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-brand-950">
        Kredi Paketleri
      </h1>

      <PackageForm />

      <div className="overflow-x-auto rounded-xl border border-brand-100 bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-slate-500">
              <th className="px-4 py-2 font-medium">Paket</th>
              <th className="px-4 py-2 font-medium">Kredi</th>
              <th className="px-4 py-2 font-medium">Fiyat</th>
              <th className="px-4 py-2 font-medium">Durum</th>
              <th className="px-4 py-2 font-medium">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {packages.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                  Henüz paket eklenmedi.
                </td>
              </tr>
            )}
            {packages.map((p) => (
              <tr key={p.id} className="border-b border-slate-50 last:border-0">
                <td className="px-4 py-2 text-slate-900">{p.name}</td>
                <td className="px-4 py-2 text-slate-600">{p.credits}</td>
                <td className="px-4 py-2 text-slate-600">
                  {Number(p.priceTRY).toLocaleString("tr-TR", {
                    style: "currency",
                    currency: "TRY",
                  })}
                </td>
                <td className="px-4 py-2">
                  {p.isActive ? (
                    <span className="text-emerald-600">Aktif</span>
                  ) : (
                    <span className="text-slate-400">Pasif</span>
                  )}
                </td>
                <td className="px-4 py-2">
                  <ToggleActiveButton id={p.id} isActive={p.isActive} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
