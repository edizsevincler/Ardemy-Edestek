import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { MessageThread } from "@/components/MessageThread";
import { MessageForm } from "./MessageForm";
import { MarkThreadRead } from "./MarkThreadRead";

export default async function StudentMessagesPage() {
  const session = await auth();
  const studentId = session!.user.id;

  const messages = await prisma.message.findMany({
    where: { studentId },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-4">
      <MarkThreadRead />
      <h1 className="text-2xl font-semibold text-slate-900">Mesajlar</h1>
      <div className="rounded-lg border border-slate-200 bg-white">
        <MessageThread messages={messages} viewerRole="STUDENT" />
        <MessageForm />
      </div>
    </div>
  );
}
