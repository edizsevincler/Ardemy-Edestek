import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { PackageCard } from "./PackageCard";
import { getT } from "@/lib/i18n/server";

const BANK_TRANSFER_INFO =
  process.env.BANK_TRANSFER_INFO ??
  "Havale bilgileri henüz eklenmedi. (Admin: Vercel'de BANK_TRANSFER_INFO ortam değişkenini ekleyin.)";

// wa.me linki sadece rakam ister (boşluk, + ve parantez kaldırılır).
const WHATSAPP_NUMBER = process.env.WHATSAPP_NUMBER;
const WHATSAPP_DIGITS = WHATSAPP_NUMBER?.replace(/[^0-9]/g, "");

export default async function GuestCreditsPage() {
  const t = await getT();
  const WHATSAPP_LINK = WHATSAPP_DIGITS
    ? `https://wa.me/${WHATSAPP_DIGITS}?text=${encodeURIComponent(
        t("Merhaba, kredi paketi için dekontumu iletiyorum:")
      )}`
    : null;
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
          {t("Kredi Satın Al")}
        </h1>
        <div className="rounded-lg border border-brand-100 bg-white transition-shadow duration-200 hover:shadow-md px-4 py-2 text-sm">
          <span className="text-slate-500">{t("Bakiyeniz:")} </span>
          <span className="font-medium text-brand-950">{t("{n} kredi", { n: me?.credits ?? 0 })}</span>
        </div>
      </div>

      <div className="space-y-1 rounded-lg border border-brand-200 bg-brand-50 px-4 py-3 text-sm text-brand-800">
        <p className="font-medium">{t("Ödeme: Banka Havalesi / EFT")}</p>
        <p className="whitespace-pre-line text-brand-700">
          {BANK_TRANSFER_INFO}
        </p>
        <p className="text-brand-600">
          {t("Almak istediğiniz paket için havaleyi gönderdikten sonra aşağıdan \"Havaleyi Gönderdim\" butonuna basın; dekontu tarafımıza iletin")}
          {WHATSAPP_LINK ? (
            <>
              {" "}
              (
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline hover:text-brand-800"
              >
                WhatsApp: {WHATSAPP_NUMBER}
              </a>
              )
            </>
          ) : (
            t(" (mesaj/WhatsApp)")
          )}
          {t(". Onaylandığında kredi hesabınıza otomatik eklenir.")}
        </p>
      </div>

      {packages.length === 0 ? (
        <p className="text-sm text-slate-500">
          {t("Şu anda satışta paket bulunmuyor.")}
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
