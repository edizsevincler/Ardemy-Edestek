import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AssignmentCard } from "./AssignmentCard";
import { formatSessionStatus } from "@/lib/session-status";

export default async function StudentHomePage() {
  const session = await auth();
  const studentId = session!.user.id;

  const [me, assignments, lessonFiles] = await Promise.all([
    prisma.user.findUnique({
      where: { id: studentId },
      select: { sessionType: true, sessionsRemaining: true },
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

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-slate-900">Hoş geldiniz</h1>
        {me && (
          <div className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm">
            <span className="text-slate-500">Kalan: </span>
            <span className="font-medium text-slate-900">
              {formatSessionStatus(me.sessionType, me.sessionsRemaining)}
            </span>
          </div>
        )}
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
        {lessonFiles.length === 0 && (
          <p className="text-sm text-slate-500">
            Henüz size özel ders dosyası yok.
          </p>
        )}
        <div className="space-y-2">
          {lessonFiles.map((f) => (
            <div
              key={f.id}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-4"
            >
              <div>
                <p className="font-medium text-slate-900">{f.title}</p>
                <p className="text-xs text-slate-500">
                  {(f.lessonDate ?? f.uploadedAt).toLocaleDateString("tr-TR")}
                </p>
              </div>
              <a
                href={`/api/lesson-files/${f.id}`}
                className="text-sm text-slate-600 underline hover:text-slate-900"
              >
                İndir
              </a>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
