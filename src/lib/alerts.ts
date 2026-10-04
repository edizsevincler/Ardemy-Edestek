import { sendAdminAlertEmail } from "@/lib/email";

// Aynı hata için en fazla 15 dakikada bir e-posta (e-posta yağmurunu önler).
// Sunucusuz ortamda her örnek kendi sayacını tutar; yine de yeterli bir sınırdır.
const THROTTLE_MS = 15 * 60 * 1000;
const lastSent = new Map<string, number>();

type RequestInfo = { path: string; method: string };
type ErrorContext = { routerKind?: string; routePath?: string; routeType?: string };

// Sorgu parametreleri (token gibi hassas olabilir) ve kullanıcı verisi
// e-postaya eklenmez; yalnızca yol, hata mesajı ve özet kodu gönderilir.
export async function notifyServerError(
  err: unknown,
  request: RequestInfo,
  context: ErrorContext
) {
  const message = err instanceof Error ? err.message : String(err);
  // Ziyaretçi sayfa yüklenirken sekmeyi kapattı / başka sayfaya geçti: gerçek
  // bir hata değil, uyarı e-postası gerektirmez.
  if (/destination stream closed early|aborted|ECONNRESET|socket hang up|client disconnected/i.test(message)) {
    return;
  }
  const digest =
    typeof err === "object" && err !== null && "digest" in err
      ? String((err as { digest: unknown }).digest)
      : "";
  const path = request.path.split("?")[0];

  const key = `${path}|${message.slice(0, 80)}`;
  const now = Date.now();
  if (now - (lastSent.get(key) ?? 0) < THROTTLE_MS) return;
  lastSent.set(key, now);

  await sendAdminAlertEmail(
    `⚠️ Ardemy sitesinde sunucu hatası: ${path}`,
    [
      `Yol: ${request.method} ${path}`,
      `Rota: ${context.routePath ?? "-"} (${context.routeType ?? "-"})`,
      `Hata: ${message.slice(0, 400)}`,
      digest ? `Özet kodu: ${digest}` : "",
      "",
      "Ayrıntı için Vercel > Project > Logs sayfasına bakın.",
    ]
      .filter(Boolean)
      .join("\n")
  );
}
