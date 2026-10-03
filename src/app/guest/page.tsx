import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  displayStreak,
  nextStreakMilestone,
  FREEZE_MAX,
  FREEZE_PRICE_CREDITS,
} from "@/lib/streak";
import { StreakFreezeCard } from "@/components/StreakFreezeCard";
import { ReferralCard } from "@/components/ReferralCard";
import { DailyQuestionSection } from "@/components/DailyQuestionSection";
import { BadgesCard } from "@/components/BadgesCard";

export default async function GuestHomePage() {
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
  const streak = me ? displayStreak(me.currentStreak, me.lastStreakDate, me.streakFreezes) : 0;
  const daysToReward = nextStreakMilestone(streak) - streak;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-brand-950">Hoş geldiniz</h1>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-brand-100 bg-white transition-shadow duration-200 hover:shadow-md p-5 shadow-sm">
          <p className="text-sm text-slate-500">Kredi bakiyeniz</p>
          <p className="mt-1 text-2xl font-semibold text-brand-950">
            {me?.credits ?? 0}
          </p>
        </div>
        <div className="rounded-xl border border-brand-100 bg-white transition-shadow duration-200 hover:shadow-md p-5 shadow-sm">
          <p className="text-sm text-slate-500">Açtığınız sorular</p>
          <p className="mt-1 text-2xl font-semibold text-brand-950">
            {unlockedCount}
          </p>
        </div>
        <div className="rounded-xl border border-brand-100 bg-white transition-shadow duration-200 hover:shadow-md p-5 shadow-sm">
          <p className="text-sm text-slate-500">Yayında soru</p>
          <p className="mt-1 text-2xl font-semibold text-brand-950">
            {questionCount}
          </p>
        </div>
        <div className="rounded-xl border border-orange-200 bg-orange-50 p-5 shadow-sm">
          <p className="text-sm text-slate-500">🔥 Çalışma seriniz</p>
          <p className="mt-1 text-2xl font-semibold text-brand-950">
            {streak} gün
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {daysToReward} gün sonra 40 dk hediye ders!
          </p>
        </div>
      </div>

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
          Soru Bankasına Git
        </Link>
        <Link
          href="/guest/credits"
          className="rounded-lg bg-gradient-to-r from-gold-500 to-gold-400 px-4 py-2 text-sm font-semibold text-brand-950 shadow-sm transition-all duration-200 hover:from-gold-400 hover:to-gold-300 hover:scale-[1.03] hover:shadow-lg active:scale-95"
        >
          Kredi Satın Al
        </Link>
      </div>

      <BadgesCard userId={session!.user.id} />

      <ReferralCard userId={session!.user.id} />
    </div>
  );
}
