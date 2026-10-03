import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ShopItems } from "@/components/ShopItems";
import { getT } from "@/lib/i18n/server";

export default async function ShopPage() {
  const t = await getT();
  const session = await auth();
  const userId = session!.user.id;

  const me = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: {
      name: true,
      credits: true,
      equippedTitle: true,
      equippedFrame: true,
      cosmetics: { select: { itemId: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-brand-950">{t("🛍️ Mağaza")}</h1>
        <span className="rounded-full bg-gold-100 px-3 py-1 text-sm font-medium text-gold-700">
          {t("{n} kredi", { n: me.credits })}
        </span>
      </div>
      <p className="text-sm text-slate-600">
        {t("Kredilerinle profilini kişiselleştir. Satın aldığın ürünler sana ait olur; istediğin zaman değiştirebilirsin. Krediye ihtiyacın varsa")}{" "}
        <Link href="/guest/credits" className="font-medium text-brand-600 underline">
          {t("kredi satın alabilirsin")}
        </Link>
        .
      </p>
      <ShopItems
        name={me.name}
        credits={me.credits}
        owned={me.cosmetics.map((c) => c.itemId)}
        equippedTitle={me.equippedTitle}
        equippedFrame={me.equippedFrame}
      />
    </div>
  );
}
