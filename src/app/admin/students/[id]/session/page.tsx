import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { EditSessionForm } from "./EditSessionForm";

export default async function EditSessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const student = await prisma.user.findUnique({ where: { id } });

  if (!student || student.role !== "STUDENT") {
    notFound();
  }

  return (
    <div className="max-w-md space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">
        {student.name} — Oturum Ayarı
      </h1>
      <EditSessionForm
        studentId={student.id}
        sessionType={student.sessionType}
        sessionsRemaining={student.sessionsRemaining}
      />
    </div>
  );
}
