import { prisma } from "@/lib/prisma";
import { getOrCreateReferralCode, REFERRAL_REWARD_CREDITS } from "@/lib/referral";
import { CopyLinkButton } from "@/components/CopyLinkButton";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export async function ReferralCard({ userId }: { userId: string }) {
  const [code, referredCount] = await Promise.all([
    getOrCreateReferralCode(userId),
    prisma.user.count({ where: { referredById: userId } }),
  ]);
  const link = `${APP_URL}/register?ref=${code}`;

  return (
    <div className="rounded-xl border border-brand-100 bg-white transition-shadow duration-200 hover:shadow-md p-5 shadow-sm">
      <h2 className="font-medium text-brand-950">🎁 Arkadaşını Getir</h2>
      <p className="mt-1 text-sm text-slate-500">
        Linkini paylaş, arkadaşın ilk kredi paketini satın aldığında ikinize
        de {REFERRAL_REWARD_CREDITS} kredi hediye edilir.
      </p>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row">
        <input
          readOnly
          value={link}
          className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-600 outline-none"
        />
        <CopyLinkButton text={link} />
      </div>
      {referredCount > 0 && (
        <p className="mt-2 text-xs text-slate-400">
          Şu ana kadar {referredCount} kişi senin linkinle katıldı.
        </p>
      )}
    </div>
  );
}
