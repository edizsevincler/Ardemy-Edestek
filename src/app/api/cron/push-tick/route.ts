import { runPushTick } from "@/lib/push-tick";

// Her saat başı çağrılır (bkz. .github/workflows/push-tick.yml; Vercel ücretsiz
// planı saatlik cron'a izin vermez). Herkese açık olması sorun değil: yalnızca
// zamanı gelmiş hatırlatmaları gönderir ve aynı kullanıcıya günde en fazla bir
// kez gönderir; erken çağrılması hiçbir şeyi öne almaz.
export const maxDuration = 60;

export async function GET() {
  return Response.json(await runPushTick());
}
