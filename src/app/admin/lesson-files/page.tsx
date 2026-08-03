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
      include: { student: { select: { name: true } } },
    }),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Ders Dosyaları</h1>

      <LessonFileForm students={students} />

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="px-4 py-2 font-medium">Öğrenci</th>
              <th className="px-4 py-2 font-medium">Başlık</th>
              <th className="px-4 py-2 font-medium">Ders Tarihi</th>
              <th className="px-4 py-2 font-medium">Dosya</th>
              <th className="px-4 py-2 font-medium">İşlem</th>
            </tr>
          </thead>
          <tbody>
            {lessonFiles.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-slate-400">
                  Henüz dosya yüklenmedi.
                </td>
              </tr>
            )}
            {lessonFiles.map((f) => (
              <tr key={f.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-2 text-slate-900">{f.student.name}</td>
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
    </div>
  );
}
