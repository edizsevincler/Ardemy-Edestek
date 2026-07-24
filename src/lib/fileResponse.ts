import { readStoredFile } from "@/lib/storage";

export async function fileDownloadResponse(fileUrl: string, fileName: string) {
  const buffer = await readStoredFile(fileUrl);
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(
        fileName
      )}`,
    },
  });
}
