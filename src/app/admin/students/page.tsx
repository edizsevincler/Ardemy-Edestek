import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { StudentForm } from "./StudentForm";
import { SessionControls } from "./SessionControls";
import { ResetPasswordButton } from "./ResetPasswordButton";
import { GiftCreditsControl } from "./GiftCreditsControl";

export default async function StudentsPage() {
  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Öğrenciler</h1>

      <StudentForm />

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-slate-500">
              <th className="px-4 py-2 font-medium">Ad Soyad</th>
              <th className="px-4 py-2 font-medium">Kullanıcı Adı</th>
              <th className="px-4 py-2 font-medium">Kayıt Tarihi</th>
              <th className="px-4 py-2 font-medium">Son Giriş</th>
              <th className="px-4 py-2 font-medium">Oturum</th>
              <th className="px-4 py-2 font-medium">Kredi</th>
              <th className="px-4 py-2 font-medium"></th>
            </tr>
          </thead>
          <tbody>
            {students.length === 0 && (
              <tr>
                <td colSpan={7} className="px-4 py-6 text-center text-slate-400">
                  Henüz öğrenci eklenmedi.
                </td>
              </tr>
            )}
            {students.map((student) => (
              <tr key={student.id} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-2 text-slate-900">{student.name}</td>
                <td className="px-4 py-2 font-mono text-slate-600">
                  {student.username}
                </td>
                <td className="px-4 py-2 text-slate-500">
                  {student.createdAt.toLocaleDateString("tr-TR")}
                </td>
                <td className="px-4 py-2 text-slate-500">
                  {student.lastLoginAt
                    ? student.lastLoginAt.toLocaleString("tr-TR")
                    : "Henüz giriş yapmadı"}
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <SessionControls
                    studentId={student.id}
                    studentName={student.name}
                    sessionType={student.sessionType}
                    sessionsRemaining={student.sessionsRemaining}
                  />
                </td>
                <td className="px-4 py-2 whitespace-nowrap">
                  <GiftCreditsControl
                    studentId={student.id}
                    studentName={student.name}
                    credits={student.credits}
                  />
                </td>
                <td className="px-4 py-2 space-x-3 whitespace-nowrap">
                  <Link
                    href={`/admin/students/${student.id}/session`}
                    className="text-slate-600 underline hover:text-slate-900"
                  >
                    Düzenle
                  </Link>
                  <ResetPasswordButton
                    studentId={student.id}
                    studentName={student.name}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
