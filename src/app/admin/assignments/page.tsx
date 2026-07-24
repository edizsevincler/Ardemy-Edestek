import { prisma } from "@/lib/prisma";
import { AssignmentForm } from "./AssignmentForm";
import { getLateLabel } from "@/lib/lateness";

export default async function AssignmentsPage() {
  const [students, assignments] = await Promise.all([
    prisma.user.findMany({
      where: { role: "STUDENT" },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.assignment.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        student: { select: { name: true } },
        submissions: {
          select: { id: true, fileName: true, note: true, submittedAt: true },
        },
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Ödevler</h1>

      <AssignmentForm students={students} />

      <div className="rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="px-4 py-2 font-medium">Öğrenci</th>
              <th className="px-4 py-2 font-medium">Başlık</th>
              <th className="px-4 py-2 font-medium">Son Tarih</th>
              <th className="px-4 py-2 font-medium">Dosya</th>
              <th className="px-4 py-2 font-medium">Teslim</th>
            </tr>
          </thead>
          <tbody>
            {assignments.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                  Henüz ödev atanmadı.
                </td>
              </tr>
            )}
            {assignments.map((a) => (
              <tr key={a.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-2 text-slate-900">{a.student.name}</td>
                <td className="px-4 py-2 text-slate-900">{a.title}</td>
                <td className="px-4 py-2 text-slate-500">
                  {a.dueDate ? a.dueDate.toLocaleDateString("tr-TR") : "—"}
                </td>
                <td className="px-4 py-2">
                  {a.fileUrl ? (
                    <a
                      href={`/api/assignments/${a.id}/file`}
                      className="text-slate-600 underline hover:text-slate-900"
                    >
                      İndir
                    </a>
                  ) : (
                    <span className="text-slate-300">—</span>
                  )}
                </td>
                <td className="px-4 py-2 text-slate-500">
                  {a.submissions.length > 0 ? (
                    <div className="space-y-1.5">
                      {a.submissions.map((s) => {
                        const lateLabel = getLateLabel(a.dueDate, s.submittedAt);
                        return (
                          <div key={s.id}>
                            <a
                              href={`/api/submissions/${s.id}`}
                              className={`underline ${
                                lateLabel
                                  ? "text-red-700 hover:text-red-900"
                                  : "text-emerald-700 hover:text-emerald-900"
                              }`}
                            >
                              {s.fileName}
                            </a>
                            <span className="text-slate-400">
                              {" "}
                              ({s.submittedAt.toLocaleDateString("tr-TR")})
                            </span>
                            {lateLabel && (
                              <p className="text-xs font-medium text-red-600">
                                {lateLabel} geç teslim edildi
                              </p>
                            )}
                            {s.note && (
                              <p className="text-xs text-slate-500">
                                Not: {s.note}
                              </p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    "Bekliyor"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
