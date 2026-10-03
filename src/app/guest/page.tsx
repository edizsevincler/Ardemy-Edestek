import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  dateKey,
  displayStreak,
  nextStreakMilestone,
  FREEZE_MAX,
  FREEZE_PRICE_CREDITS,
} from "@/lib/streak";
import { ShareButton } from "@/components/ShareButton";
import { getReferralShareUrl } from "@/lib/referral";
import { StreakFreezeCard } from "@/components/StreakFreezeCard";
import { StreakCard } from "@/components/StreakCard";
import { ReferralCard } from "@/components/ReferralCard";
import { DailyQuestionSection } from "@/components/DailyQuestionSection";
import { BadgesCard } from "@/components/BadgesCard";
import { getT } from "@/lib/i18n/server";

export default async function GuestHomePage() {
  const t = await getT();
  const session = await auth();
  const [me, unlockedCount, questionCount] = await Promise.all([
    prisma.user.findUnique({
      where: { id: session!.user.id },
      select: {
        credits: true,
        currentStreak: true,
        lastStreakDate: true,
        streakFreezes: true,
      },
    }),
    prisma.questionUnlock.count({ where: { userId: session!.user.id } }),
    prisma.question.count({ where: { isPublished: true } }),
  ]);
  const shareUrl = await getReferralShareUrl(session!.user.id);
  const streak = me ? displayStreak(me.currentStreak, me.lastStreakDate, me.streakFreezes) : 0;
  const milestone = nextStreakMilestone(streak);
  const doneToday = !!me?.lastStreakDate && dateKey(me.lastStreakDate) === dateKey(new Date());

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-brand-950">{t("Hoş geldiniz")}</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-brand-100 bg-white transition-shadow duration-200 hover:shadow-md p-5 shadow-sm">
          <p className="text-sm text-slate-500">{t("Kredi bakiyeniz")}</p>
          <p className="mt-1 text-2xl font-semibold text-brand-950">
            {me?.credits ?? 0}
          </p>
        </div>
        <div className="rounded-xl border border-brand-100 bg-white transition-shadow duration-200 hover:shadow-md p-5 shadow-sm">
          <p className="text-sm text-slate-500">{t("Açtığınız sorular")}</p>
          <p className="mt-1 text-2xl font-semibold text-brand-950">
            {unlockedCount}
          </p>
        </div>
        <div className="rounded-xl border border-brand-100 bg-white transition-shadow duration-200 hover:shadow-md p-5 shadow-sm">
          <p className="text-sm text-slate-500">{t("Yayında soru")}</p>
          <p className="mt-1 text-2xl font-semibold text-brand-950">
            {questionCount}
          </p>
        </div>
      </div>

      <StreakCard streak={streak} milestone={milestone} doneToday={doneToday}>
        {streak >= 1 && (
          <ShareButton
            small
            imagePath="/api/share/streak"
            filename="ardemy-seri.png"
            label={t("Serimi paylaş")}
            text={t("{n} gündür her gün çalışıyorum! 🔥 Sen de dene: {url}", { n: streak, url: shareUrl })}
          />
        )}
      </StreakCard>

      <DailyQuestionSection userId={session!.user.id} />

      <StreakFreezeCard
        freezes={me?.streakFreezes ?? 0}
        max={FREEZE_MAX}
        price={FREEZE_PRICE_CREDITS}
        credits={me?.credits ?? 0}
      />

      <div className="flex gap-3">
        <Link
          href="/guest/questions"
          className="rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:from-brand-500 hover:to-brand-400 hover:scale-[1.03] hover:shadow-lg active:scale-95"
        >
          {t("Soru Bankasına Git")}
        </Link>
        <Link
          href="/guest/credits"
          className="rounded-lg bg-gradient-to-r from-gold-500 to-gold-400 px-4 py-2 text-sm font-semibold text-brand-950 shadow-sm transition-all duration-200 hover:from-gold-400 hover:to-gold-300 hover:scale-[1.03] hover:shadow-lg active:scale-95"
        >
          {t("Kredi Satın Al")}
        </Link>
      </div>

      <BadgesCard userId={session!.user.id} />

      <ReferralCard userId={session!.user.id} />
    </div>
  );
}
