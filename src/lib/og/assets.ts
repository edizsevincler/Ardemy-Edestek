import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Paylaşım görselleri için yazı tipleri (Inter, OFL lisansı) ve logo. Türkçe
// karakterler latin-ext, Rusça harfler cyrillic alt kümesindedir; aynı ada
// sahip fontlar satori'de sırayla yedek (fallback) olarak denenir.
// Dosya yolları nft'nin izleyebilmesi için düz string olarak yazıldı.

type OgFont = {
  name: string;
  data: Buffer;
  weight: 400 | 700;
  style: "normal";
};

let cached: Promise<{ fonts: OgFont[]; logo: string }> | null = null;

async function load() {
  const read = (file: string) => readFile(join(process.cwd(), "src/lib/og/fonts", file));
  const [l4, l7, e4, e7, c4, c7, logo] = await Promise.all([
    read("inter-latin-400-normal.woff"),
    read("inter-latin-700-normal.woff"),
    read("inter-latin-ext-400-normal.woff"),
    read("inter-latin-ext-700-normal.woff"),
    read("inter-cyrillic-400-normal.woff"),
    read("inter-cyrillic-700-normal.woff"),
    readFile(join(process.cwd(), "src/lib/og/logo.jpg"), "base64"),
  ]);
  const font = (data: Buffer, weight: 400 | 700): OgFont => ({
    name: "Inter",
    data,
    weight,
    style: "normal",
  });
  return {
    fonts: [
      font(l4, 400),
      font(e4, 400),
      font(c4, 400),
      font(l7, 700),
      font(e7, 700),
      font(c7, 700),
    ],
    logo: `data:image/jpeg;base64,${logo}`,
  };
}

export function getOgAssets() {
  cached ??= load().catch((error) => {
    cached = null; // başarısız yükleme bir sonraki istekte yeniden denensin
    throw error;
  });
  return cached;
}

export const OG_FORMATS = {
  square: { width: 1080, height: 1080 },
  story: { width: 1080, height: 1920 },
} as const;

export type OgFormat = keyof typeof OG_FORMATS;

export function parseFormat(value: string | null): OgFormat {
  return value === "story" ? "story" : "square";
}
