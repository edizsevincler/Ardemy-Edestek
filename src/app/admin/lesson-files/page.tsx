import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { LessonFileForm } from "./LessonFileForm";
import { DeleteButton } from "./DeleteButton";

export default async function LessonFilesPage() {
  const [students, lessonFiles] = await Promise.all([
    prisma.user.findMany({
      where: { role: "STUDENT" },
      orderBy: { name: "asc" },
      select: { id: true, name: true },
    }),
    prisma.lessonFile.findMany({
      orderBy: [
        { lessonDate: { sort: "desc", nulls: "last" } },
        { uploadedAt: "desc" },
      ],
      include: { student: { select: { id: true, name: true } } },
    }),
  ]);

  const groups = new Map<
    string,
    { studentName: string; files: typeof lessonFiles }
  >();
  for (const f of lessonFiles) {
    const group = groups.get(f.student.id);
    if (group) {
      group.files.push(f);
    } else {
      groups.set(f.student.id, { studentName: f.student.name, files: [f] });
    }
  }
  const sortedGroups = Array.from(groups.values()).sort((a, b) =>
    a.studentName.localeCompare(b.studentName, "tr")
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Ders Dosyaları</h1>

      <LessonFileForm students={students} />

      {sortedGroups.length === 0 ? (
        <p className="rounded-lg border border-slate-200 bg-white px-4 py-6 text-center text-sm text-slate-400">
          Henüz dosya yüklenmedi.
        </p>
      ) : (
        <div className="space-y-3">
          {sortedGroups.map((group) => (
            <details
              key={group.studentName}
              className="rounded-lg border border-slate-200 bg-white"
            >
              <summary className="cursor-pointer select-none px-4 py-3 font-medium text-slate-900">
                {group.studentName}{" "}
                <span className="font-normal text-slate-400">
                  ({group.files.length} dosya)
                </span>
              </summary>
              <div className="overflow-x-auto border-t border-slate-200">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-slate-500">
                      <th className="px-4 py-2 font-medium">Başlık</th>
                      <th className="px-4 py-2 font-medium">Ders Tarihi</th>
                      <th className="px-4 py-2 font-medium">Dosya</th>
                      <th className="px-4 py-2 font-medium">İşlem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.files.map((f) => (
                      <tr
                        key={f.id}
                        className="border-b border-slate-100 last:border-0"
                      >
                        <td className="px-4 py-2 text-slate-900">{f.title}</td>
                        <td className="px-4 py-2 text-slate-500">
                          {f.lessonDate
                            ? f.lessonDate.toLocaleDateString("tr-TR")
                            : "—"}
                        </td>
                        <td className="px-4 py-2">
                          <a
                            href={`/api/lesson-files/${f.id}`}
                            className="text-slate-600 underline hover:text-slate-900"
                          >
                            İndir
                          </a>
                        </td>
                        <td className="px-4 py-2 space-x-3">
                          <Link
                            href={`/admin/lesson-files/${f.id}/edit`}
                            className="text-slate-600 underline hover:text-slate-900"
                          >
                            Düzenle
                          </Link>
                          <DeleteButton id={f.id} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
