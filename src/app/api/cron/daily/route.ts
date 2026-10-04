import { runFirstTestInvites, sendWeeklyBackup, sendWeeklySummary } from "@/lib/cron-tasks";

// Vercel Cron her gün 08:00 UTC (11:00 Türkiye) çağırır (bkz. vercel.json).
// Günlük: ilk test daveti. Pazartesileri ayrıca: haftalık özet + haftalık yedek.
// Görevler birbirinden bağımsızdır; biri hata verirse diğerleri yine çalışır.
export const maxDuration = 60;

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return new Response("CRON_SECRET tanımlı değil", { status: 503 });
  if (request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const url = new URL(request.url);
  // ?weekly=1 ile gün fark etmeksizin haftalık görevler elle de çalıştırılabilir.
  const isMonday =
    new Date().toLocaleDateString("en-US", { weekday: "long", timeZone: "Europe/Istanbul" }) ===
    "Monday";
  const runWeekly = isMonday || url.searchParams.get("weekly") === "1";

  const result: Record<string, unknown> = {};

  try {
    result.firstTest = await runFirstTestInvites();
  } catch (error) {
    result.firstTest = { error: String(error) };
  }

  if (runWeekly) {
    try {
      await sendWeeklySummary();
      result.summary = "gönderildi";
    } catch (error) {
      result.summary = { error: String(error) };
    }
    try {
      result.backup = await sendWeeklyBackup();
    } catch (error) {
      result.backup = { error: String(error) };
    }
  }

  return Response.json(result);
}
