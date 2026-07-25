import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { EditQuestionForm } from "./EditQuestionForm";

export default async function EditQuestionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const question = await prisma.question.findUnique({ where: { id } });

  if (!question) {
    notFound();
  }

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-semibold text-brand-950">
        Soruyu Düzenle
      </h1>
      <EditQuestionForm
        id={question.id}
        type={question.type}
        title={question.title}
        subject={question.subject}
        body={question.body ?? ""}
        creditCost={question.creditCost}
        isPublished={question.isPublished}
        currentFileName={question.fileName}
      />
    </div>
  );
}
