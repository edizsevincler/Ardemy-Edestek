import Link from "next/link";
import { getT } from "@/lib/i18n/server";

// Panelde kelime kartlarına götüren küçük kart.
export async function CardsPromo({ count }: { count: number }) {
  const t = await getT();
  return (
    <Link
      href="/guest/cards"
      className="flex items-center justify-between gap-4 rounded-xl border border-brand-100 bg-white p-5 shadow-sm transition-shadow duration-200 hover:shadow-md"
    >
      <div className="min-w-0">
        <h2 className="font-medium text-brand-950">{t("🃏 Kelime Kartları")}</h2>
        <p className="mt-1 text-sm text-slate-500">
          {count > 0
            ? t("Derslerinden {n} kelime kartın hazır. Kaydırarak çalış.", { n: count })
            : t("Her gün 10 ücretsiz kelime kartı. Kaydırarak çalış.")}
        </p>
      </div>
      <span className="shrink-0 rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-2 text-sm font-medium text-white shadow-sm">
        {t("Kartlara git")}
      </span>
    </Link>
  );
}
