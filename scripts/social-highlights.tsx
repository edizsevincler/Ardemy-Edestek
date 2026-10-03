// Kullanım: npx tsx scripts/social-highlights.tsx "<çıktı-klasörü>"
//
// Instagram "Öne Çıkanlar" kapak simgeleri (1080x1920, ortada büyük simge).
// Kapağı yüklerken Instagram yuvarlak keser; simge bu yüzden ortada ve büyük.

import "dotenv/config";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getOgAssets, OG_FORMATS } from "../src/lib/og/assets";
import { HighlightCover } from "../src/lib/og/cards-extra";
import { put } from "./lib/social-kit";

const OUT = process.argv[2];
if (!OUT) {
  console.error("Çıktı klasörü gerekli.");
  process.exit(1);
}

const COVERS: [file: string, emoji: string, name: string][] = [
  ["1-gunun-sorusu", "📅", "Günün Sorusu"],
  ["2-mini-dersler", "📖", "Mini Dersler"],
  ["3-nasil-calisir", "💡", "Nasıl Çalışır?"],
  ["4-ogrenciler", "🏆", "Öğrenciler"],
  ["5-ucretsiz-test", "📝", "Ücretsiz Test"],
];

async function main() {
  const { fonts } = await getOgAssets();
  const size = OG_FORMATS.story;
  for (const [file, emoji] of COVERS) {
    const res = new ImageResponse(<HighlightCover size={size} emoji={emoji} />, { ...size, fonts });
    await put(OUT, `${file}.png`, Buffer.from(await res.arrayBuffer()));
  }
  await put(OUT, "OKU-BENI.txt", [
    "INSTAGRAM ÖNE ÇIKANLAR KAPAKLARI",
    "",
    "Nasıl eklenir: Profilinde Öne Çıkanlar'daki \"+ Yeni\" > ilgili hikâyeleri seç > Kapağı Düzenle > galeriden bu dosyayı seç.",
    "Öne Çıkan adı olarak aşağıdaki isimleri yaz:",
    ...COVERS.map(([file, emoji, name]) => `  ${file}.png  ->  ${emoji} ${name}`),
    "",
    "İçerik önerisi:",
    "  Günün Sorusu : her cevap hikâyesini buraya ekle",
    "  Mini Dersler : çarşamba mini ders ve perşembe Reels hikâyeleri",
    "  Nasıl Çalışır?: panelin ekran görüntüleri (seri, rozet, deneme sınavı)",
    "  Öğrenciler   : izinli öğrenci başarıları ve seni etiketleyen hikâyeler",
    "  Ücretsiz Test: cuma günkü \"5 soruda seviyeni dene\" hikâyesi",
  ].join("\n"));
  console.log("Kapaklar hazır:", OUT);
  process.exit(0);
}

main();
