import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { readStoredFile } from "@/lib/storage";

// Yazılı test sayfa görseli. İlk sayfa önizleme olarak herkese (girişli) açık;
// diğer sayfalar için testin açılmış olması gerekir. Yöneticiler hepsini görür.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string; n: string }> }) {
  const session = await auth();
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const { id, n } = await params;
  const index = Number(n) - 1;
  const question = await prisma.question.findUnique({
    where: { id },
    select: { isPublished: true, pageImages: true },
  });
  const url = question?.pageImages[index];
  if (!question || !Number.isInteger(index) || !url) return new Response("Not found", { status: 404 });

  if (session.user.role !== "ADMIN") {
    if (!question.isPublished) return new Response("Not found", { status: 404 });
    if (index > 0) {
      const unlock = await prisma.questionUnlock.findUnique({
        where: { userId_questionId: { userId: session.user.id, questionId: id } },
      });
      if (!unlock) return new Response("Forbidden", { status: 403 });
    }
  }

  const buffer = await readStoredFile(url);
  const type = url.toLowerCase().endsWith(".png") ? "image/png" : url.toLowerCase().endsWith(".webp") ? "image/webp" : "image/jpeg";
  return new Response(new Uint8Array(buffer), {
    headers: { "Content-Type": type, "Cache-Control": "private, max-age=3600" },
  });
}
