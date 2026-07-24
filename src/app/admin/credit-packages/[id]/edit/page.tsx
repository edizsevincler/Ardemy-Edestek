import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { EditPackageForm } from "./EditPackageForm";

export default async function EditCreditPackagePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pkg = await prisma.creditPackage.findUnique({ where: { id } });

  if (!pkg) {
    notFound();
  }

  return (
    <div className="max-w-md space-y-6">
      <h1 className="text-2xl font-semibold text-brand-950">
        Paketi Düzenle
      </h1>
      <EditPackageForm
        id={pkg.id}
        name={pkg.name}
        credits={pkg.credits}
        priceTRY={Number(pkg.priceTRY)}
      />
    </div>
  );
}
