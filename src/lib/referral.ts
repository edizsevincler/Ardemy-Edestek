import { prisma } from "@/lib/prisma";
import { generateReferralCode } from "@/lib/generate";
import { Prisma } from "@/generated/prisma/client";

export const REFERRAL_REWARD_CREDITS = 3;

// Referans kodu ilk ihtiyaç duyulduğunda (öğrenci/misafir panelini ilk
// açtığında) üretilip kalıcı olarak atanır — kayıt anında üretmeye gerek
// yok, böylece eski kullanıcılar için ayrı bir taşıma script'i gerekmez.
export async function getOrCreateReferralCode(userId: string): Promise<string> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { referralCode: true },
  });
  if (user.referralCode) return user.referralCode;

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateReferralCode();
    try {
      await prisma.user.update({
        where: { id: userId },
        data: { referralCode: code },
      });
      return code;
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        continue; // kod çakıştı, tekrar dene
      }
      throw error;
    }
  }
  throw new Error("Referans kodu oluşturulamadı.");
}

// Bir kullanıcının kredi alışverişi onaylandığında çağrılır. Bu, o
// kullanıcının İLK onaylanan alışverişiyse ve bir davetliyse, hem
// davet edene hem davet edilene bir kerelik kredi ödülü verir.
export async function grantReferralRewardIfEligible(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { referredById: true, referralRewardGiven: true },
  });
  if (!user?.referredById || user.referralRewardGiven) return;

  const paidCount = await prisma.creditPurchase.count({
    where: { userId, status: "PAID" },
  });
  if (paidCount !== 1) return; // ilk onaylanan alışverişi değil

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        credits: { increment: REFERRAL_REWARD_CREDITS },
        referralRewardGiven: true,
      },
    }),
    prisma.user.update({
      where: { id: user.referredById },
      data: { credits: { increment: REFERRAL_REWARD_CREDITS } },
    }),
  ]);
}
