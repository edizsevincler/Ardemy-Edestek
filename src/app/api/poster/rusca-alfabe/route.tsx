import { ImageResponse } from "next/og";
import { getOgAssets } from "@/lib/og/assets";
import { AlphabetPoster, POSTER_SIZE } from "@/lib/og/alphabet-poster";

// Herkese açık Rusça alfabe posteri (PNG). ?download=1 ile dosya olarak iner.
export async function GET(request: Request) {
  const { fonts, logo } = await getOgAssets();
  const download = new URL(request.url).searchParams.get("download") === "1";
  return new ImageResponse(<AlphabetPoster logo={logo} />, {
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
