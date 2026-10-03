import { cookies, headers } from "next/headers";
import { getLocale } from "@/lib/i18n/server";
import { isBot, isTrackedPath, recordPageView } from "@/lib/pageviews";
import { sanitizeSource, SOURCE_COOKIE } from "@/lib/source";

// Sayfa görüntüleme sayacı (bkz. lib/pageviews.ts): botlar ve izlenmeyen
// yollar sessizce yok sayılır; her durumda 204 döner.
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { path?: unknown };
    const path = typeof body.path === "string" ? body.path : "";
    if (!isTrackedPath(path)) return new Response(null, { status: 204 });

    const userAgent = (await headers()).get("user-agent");
    if (isBot(userAgent)) return new Response(null, { status: 204 });

    const source = sanitizeSource((await cookies()).get(SOURCE_COOKIE)?.value);
    await recordPageView(path, source, await getLocale());
  } catch {
    // Sayaç hatası kullanıcıyı etkilememeli.
  }
  return new Response(null, { status: 204 });
}
