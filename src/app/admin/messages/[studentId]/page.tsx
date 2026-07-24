import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MessageThread } from "@/components/MessageThread";
import { MessageForm } from "./MessageForm";
import { MarkThreadRead } from "./MarkThreadRead";

export default async function AdminMessageThreadPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  const { studentId } = await params;

  const student = await prisma.user.findUnique({ where: { id: studentId } });
  if (!student || student.role !== "STUDENT") {
    notFound();
  }

  const messages = await prisma.message.findMany({
    where: { studentId },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-4">
      <MarkThreadRead studentId={studentId} />
      <div>
        <Link
          href="/admin/messages"
          className="text-sm text-slate-500 hover:text-slate-900"
        >
          ← Mesajlar
        </Link>
        <h1 className="text-2xl font-semibold text-slate-900">
          {student.name}
        </h1>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white">
        <MessageThread messages={messages} viewerRole="ADMIN" />
        <MessageForm studentId={studentId} />
      </div>
    </div>
  );
}
