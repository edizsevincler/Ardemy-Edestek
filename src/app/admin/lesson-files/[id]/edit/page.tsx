import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { EditForm } from "./EditForm";

export default async function EditLessonFilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const lessonFile = await prisma.lessonFile.findUnique({
    where: { id },
    include: { student: { select: { name: true } } },
  });

  if (!lessonFile) {
    notFound();
  }

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-semibold text-slate-900">
        Dosyayı Düzenle
      </h1>
      <p className="text-sm text-slate-500">
        Öğrenci: {lessonFile.student.name}
      </p>
      <EditForm
        id={lessonFile.id}
        title={lessonFile.title}
        lessonDate={
          lessonFile.lessonDate
            ? lessonFile.lessonDate.toISOString().slice(0, 10)
            : ""
        }
        currentFileName={lessonFile.fileName}
      />
    </div>
  );
}
