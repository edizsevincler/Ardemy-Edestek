import { readFile } from "node:fs/promises";
import { join } from "node:path";

// Paylaşım görselleri için yazı tipleri (Inter, OFL lisansı) ve logo. Türkçe
// karakterler latin-ext, Rusça harfler cyrillic alt kümesindedir; aynı ada
// sahip fontlar satori'de sırayla yedek (fallback) olarak denenir.
// Dosya yolları nft'nin izleyebilmesi için düz string olarak yazıldı.

// Her alt küme ayrı bir aile olarak kaydedilir; kullanım tarafında
// OG_FONT_FAMILY ile sırayla yedek verilir (böylece kalın metinde de doğru
// ağırlıktaki glif seçilir).
export const OG_FONT_FAMILY = "Inter, Inter Ext, Inter Cyr";

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
  const font = (name: string, data: Buffer, weight: 400 | 700): OgFont => ({
    name,
    data,
    weight,
    style: "normal",
  });
  return {
    fonts: [
      font("Inter", l4, 400),
      font("Inter", l7, 700),
      font("Inter Ext", e4, 400),
      font("Inter Ext", e7, 700),
      font("Inter Cyr", c4, 400),
      font("Inter Cyr", c7, 700),
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
