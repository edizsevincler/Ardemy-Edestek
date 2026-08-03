import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AssignmentCard } from "./AssignmentCard";
import { LessonFilesList } from "./LessonFilesList";
import { formatSessionStatus } from "@/lib/session-status";
import { displayStreak, nextStreakMilestone } from "@/lib/streak";

export default async function StudentHomePage() {
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

  const streak = me ? displayStreak(me.currentStreak, me.lastStreakDate) : 0;
  const daysToReward = nextStreakMilestone(streak) - streak;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold text-slate-900">Hoş geldiniz</h1>
        <div className="flex flex-wrap items-center gap-3">
          {me && (
            <div className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm">
              <span className="text-slate-500">Kalan: </span>
              <span className="font-medium text-slate-900">
                {formatSessionStatus(me.sessionType, me.sessionsRemaining)}
              </span>
            </div>
          )}
          <div className="rounded-lg border border-orange-200 bg-orange-50 px-4 py-2 text-sm">
            <span className="text-slate-500">🔥 Seri: </span>
            <span className="font-medium text-slate-900">{streak} gün</span>
            <span className="ml-1 text-xs text-slate-400">
              ({daysToReward} gün sonra 40 dk hediye ders)
            </span>
          </div>
        </div>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-medium text-slate-900">Ödevlerim</h2>
        {assignments.length === 0 && (
          <p className="text-sm text-slate-500">
            Henüz size atanmış ödev yok.
          </p>
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
          Ders Dosyalarım
        </h2>
        {lessonFiles.length === 0 ? (
          <p className="text-sm text-slate-500">
            Henüz size özel ders dosyası yok.
          </p>
        ) : (
          <LessonFilesList lessonFiles={lessonFiles} />
        )}
      </section>
    </div>
  );
}
