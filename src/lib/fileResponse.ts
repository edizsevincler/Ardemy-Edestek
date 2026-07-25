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

// Soru bankası içerikleri (PDF vs.) için: "attachment" yerine "inline"
// kullanılır ki dosya diske inmesin, sadece sayfada (filigranlı) görüntülensin.
// Not: gerçek bir kopyalama engeli değil — tarayıcının kendi PDF görüntüleyicisi
// üzerinden yine de kaydedilebilir, sadece tek tıkla indirmeyi zorlaştırıyor.
export async function fileInlineResponse(fileUrl: string, fileName: string) {
  const buffer = await readStoredFile(fileUrl);
  const isPdf = fileName.toLowerCase().endsWith(".pdf");
  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": isPdf ? "application/pdf" : "application/octet-stream",
      "Content-Disposition": `inline; filename*=UTF-8''${encodeURIComponent(
        fileName
      )}`,
    },
  });
}
