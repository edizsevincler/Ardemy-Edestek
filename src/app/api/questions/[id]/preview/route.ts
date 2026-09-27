import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { readStoredFile, extractFirstPdfPage } from "@/lib/storage";

// Kilidi açılmamış bir PDF içeriğin sadece ilk sayfasını gösterir —
// satın almadan önce kaliteyi görebilsinler diye. Tam dosyaya asla
// erişim vermez (bkz. /api/questions/[id]/file).
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
  if (
    !question ||
    !question.isPublished ||
    !question.fileUrl ||
    !question.fileName?.toLowerCase().endsWith(".pdf")
  ) {
    return new Response("Not found", { status: 404 });
  }

  const buffer = await readStoredFile(question.fileUrl);
  const preview = await extractFirstPdfPage(buffer);

  return new Response(new Uint8Array(preview), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(
        "onizleme-" + question.fileName
      )}`,
    },
  });
}
