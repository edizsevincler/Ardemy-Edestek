import Link from "next/link";
import { prisma } from "@/lib/prisma";

export default async function AdminMessagesPage() {
  const students = await prisma.user.findMany({
    where: { role: "STUDENT" },
    orderBy: { name: "asc" },
  });

  const rows = await Promise.all(
    students.map(async (student) => {
      const [lastMessage, unreadCount] = await Promise.all([
        prisma.message.findFirst({
          where: { studentId: student.id },
          orderBy: { createdAt: "desc" },
        }),
        prisma.message.count({
          where: { studentId: student.id, senderRole: "STUDENT", read: false },
        }),
      ]);
      return { student, lastMessage, unreadCount };
    })
  );

  rows.sort((a, b) => {
    const aTime = a.lastMessage?.createdAt.getTime() ?? 0;
    const bTime = b.lastMessage?.createdAt.getTime() ?? 0;
    return bTime - aTime;
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">Mesajlar</h1>

      <div className="rounded-lg border border-slate-200 bg-white">
        {rows.map(({ student, lastMessage, unreadCount }) => (
          <Link
            key={student.id}
            href={`/admin/messages/${student.id}`}
            className="flex items-center justify-between gap-4 border-b border-slate-100 px-4 py-3 last:border-0 hover:bg-slate-50"
          >
            <div className="min-w-0">
              <p className="font-medium text-slate-900">{student.name}</p>
              <p className="truncate text-sm text-slate-500">
                {lastMessage
                  ? `${lastMessage.senderRole === "ADMIN" ? "Siz: " : ""}${lastMessage.body}`
                  : "Henüz mesaj yok"}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              {lastMessage && (
                <span className="text-xs text-slate-400">
                  {lastMessage.createdAt.toLocaleDateString("tr-TR")}
                </span>
              )}
              {unreadCount > 0 && (
                <span className="rounded-full bg-red-600 px-2 py-0.5 text-xs font-medium text-white">
                  {unreadCount}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
