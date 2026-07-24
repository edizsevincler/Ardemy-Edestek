import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { fileDownloadResponse } from "@/lib/fileResponse";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) {
    return new Response("Unauthorized", { status: 401 });
  }

  const { id } = await params;
  const assignment = await prisma.assignment.findUnique({ where: { id } });
  if (!assignment || !assignment.fileUrl || !assignment.fileName) {
    return new Response("Not found", { status: 404 });
  }

  const isOwner = assignment.studentId === session.user.id;
  const isAdmin = session.user.role === "ADMIN";
  if (!isOwner && !isAdmin) {
    return new Response("Forbidden", { status: 403 });
  }

  return fileDownloadResponse(assignment.fileUrl, assignment.fileName);
}
