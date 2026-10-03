import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AssignmentCard } from "./AssignmentCard";
import { LessonFilesList } from "./LessonFilesList";
import { formatSessionStatus } from "@/lib/session-status";
import {
  dateKey,
  displayStreak,
  nextStreakMilestone,
  FREEZE_MAX,
  FREEZE_PRICE_CREDITS,
} from "@/lib/streak";
import { ShareButton } from "@/components/ShareButton";
import { StreakCard } from "@/components/StreakCard";
import { getReferralShareUrl } from "@/lib/referral";
import { StreakFreezeCard } from "@/components/StreakFreezeCard";
import { ReferralCard } from "@/components/ReferralCard";
import { DailyQuestionSection } from "@/components/DailyQuestionSection";
import { BadgesCard } from "@/components/BadgesCard";
import { getT } from "@/lib/i18n/server";
import { EmptyState } from "@/components/EmptyState";

export default async function StudentHomePage() {
  const t = await getT();
  const session = await auth();
  const studentId = session!.user.id;

  const [me, assignments, lessonFiles] = await Promise.all([
    prisma.user.findUnique({
      where: { id: studentId },
      select: {
        sessionType: true,
        sessionsRemaining: true,
        currentStreak: true,
        lastStreakDate: true,
        streakFreezes: true,
        credits: true,
      },
    }),
    prisma.assignment.findMany({
      where: { studentId },
      orderBy: { createdAt: "desc" },
      include: { submissions: { where: { studentId } } },
    }),
    prisma.lessonFile.findMany({
      where: { studentId },
      orderBy: [
        { lessonDate: { sort: "desc", nulls: "last" } },
        { uploadedAt: "desc" },
      ],
    }),
  ]);

  const shareUrl = await getReferralShareUrl(studentId);
  const streak = me ? displayStreak(me.currentStreak, me.lastStreakDate, me.streakFreezes) : 0;
  const milestone = nextStreakMilestone(streak);
  const doneToday = !!me?.lastStreakDate && dateKey(me.lastStreakDate) === dateKey(new Date());

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-slate-900">{t("Hoş geldiniz")}</h1>
        <div className="flex flex-wrap items-center gap-3">
          {me && (
            <div className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm">
              <span className="text-slate-500">{t("Kalan:")} </span>
              <span className="font-medium text-slate-900">
                {formatSessionStatus(me.sessionType, me.sessionsRemaining, t)}
              </span>
            </div>
          )}
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

      <DailyQuestionSection userId={studentId} />

      <StreakFreezeCard
        freezes={me?.streakFreezes ?? 0}
        max={FREEZE_MAX}
        price={FREEZE_PRICE_CREDITS}
        credits={me?.credits ?? 0}
      />

      <section className="space-y-3">
        <h2 className="text-lg font-medium text-slate-900">{t("Ödevlerim")}</h2>
        {assignments.length === 0 && (
          <EmptyState icon="tasks" text={t("Henüz size atanmış ödev yok.")} />
        )}
        <div className="space-y-3">
          {assignments.map((a) => (
            <AssignmentCard
              key={a.id}
              assignment={a}
              submission={a.submissions[0] ?? null}
            />
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium text-slate-900">
          {t("Ders Dosyalarım")}
        </h2>
        {lessonFiles.length === 0 ? (
          <EmptyState icon="files" text={t("Henüz size özel ders dosyası yok.")} />
        ) : (
          <LessonFilesList lessonFiles={lessonFiles} />
        )}
      </section>

      <BadgesCard userId={studentId} />

      <ReferralCard userId={studentId} />
    </div>
  );
}
