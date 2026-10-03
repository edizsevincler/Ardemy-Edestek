import { ImageResponse } from "next/og";
import { getOgAssets } from "@/lib/og/assets";
import { AlphabetPoster, POSTER_SIZE } from "@/lib/og/alphabet-poster";
import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionary";
import { makeT } from "@/lib/i18n/translate";

// Herkese açık Rusça alfabe posteri (PNG). ?lang=tr|en|ru ile dil seçilir
// (önbellek URL'ye göre ayrıldığı için çerez yerine parametre kullanılır);
// ?download=1 ile dosya olarak iner.
export async function GET(request: Request) {
  const { fonts, logo } = await getOgAssets();
  const params = new URL(request.url).searchParams;
  const lang = params.get("lang");
  const locale = isLocale(lang) ? lang : "tr";
  const download = params.get("download") === "1";
  const t = makeT(getDictionary(locale), locale);
  return new ImageResponse(<AlphabetPoster logo={logo} locale={locale} t={t} />, {
    ...POSTER_SIZE,
    fonts,
    headers: {
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
      ...(download
        ? { "Content-Disposition": 'attachment; filename="rusca-alfabe-ardemy.png"' }
        : {}),
    },
  });
}
