import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { fileInlineResponse } from "@/lib/fileResponse";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const question = await prisma.question.findUnique({ where: { id } });
  if (!question || !question.fileUrl || !question.fileName) {
    return new Response("Not found", { status: 404 });
  }

  if (session.user.role === "ADMIN") {
    return fileInlineResponse(question.fileUrl, question.fileName);
  }

  const unlock = await prisma.questionUnlock.findUnique({
    where: {
      userId_questionId: { userId: session.user.id, questionId: id },
    },
  });
  if (!unlock) {
    return new Response("Forbidden", { status: 403 });
  }

  return fileInlineResponse(question.fileUrl, question.fileName);
}
