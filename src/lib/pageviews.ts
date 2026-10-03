import { prisma } from "@/lib/prisma";
import { dateKey } from "@/lib/streak";

// Yalnızca bu herkese açık sayfalar sayılır (panel ve admin sayılmaz).
export const TRACKED_PATHS = [
  "/",
  "/login",
  "/register",
  "/link",
  "/dene",
  "/dene/rusca",
  "/dene/ingilizce",
  "/rusca-alfabe",
  "/gizlilik-politikasi",
  "/mesafeli-satis-sozlesmesi",
];

export function isTrackedPath(path: string) {
  return TRACKED_PATHS.includes(path);
}

const BOT_PATTERN =
  /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|telegram|headless|lighthouse|pingdom|uptime/i;

export function isBot(userAgent: string | null) {
  return !userAgent || BOT_PATTERN.test(userAgent);
}

// Kişi/cihaz kimliği tutulmaz: yalnızca gün + sayfa + kaynak + dil bazında sayaç.
// Tek bir atomik UPSERT ile artırılır (eşzamanlı isteklerde sayım kaybolmaz).
export async function recordPageView(path: string, source: string | null, locale: string) {
  const day = dateKey(new Date());
  await prisma.$executeRaw`
    INSERT INTO "PageViewDaily" ("day", "path", "source", "locale", "count")
    VALUES (${day}, ${path}, ${source ?? ""}, ${locale}, 1)
    ON CONFLICT ("day", "path", "source", "locale")
    DO UPDATE SET "count" = "PageViewDaily"."count" + 1
  `;
}
