// Kullanım:
//   npx tsx scripts/social-alfabe.tsx "<çıktı-klasörü>"
//
// "7 Günde Rusça Alfabe" Instagram challenge paketi: tanıtım kartı, 7 günlük
// kare görseller (her gün 4-5 harf), alfabe posteri ve her gün için açıklama.
// Veritabanı gerekmez.

import "dotenv/config";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getOgAssets } from "../src/lib/og/assets";
import { AlphabetPoster, POSTER_SIZE } from "../src/lib/og/alphabet-poster";
import { LessonSlide } from "../src/lib/og/cards-extra";
import { lettersForDay } from "../src/lib/alphabet";
import { INSTAGRAM_HANDLE, SITE_URL } from "../src/lib/site";
import { info, png, put, SQ, type Build } from "./lib/social-kit";

const OUT = process.argv[2];
if (!OUT) {
  console.error("Kullanım: social-alfabe.tsx <çıktı>");
  process.exit(1);
}

const LINK = `${SITE_URL}/rusca-alfabe`;
const FOLLOW = `📲 Takip et: ${INSTAGRAM_HANDLE}`;
const HASH = "#rusçaalfabe #kiril #rusçaöğreniyorum #rusça #dilöğrenme #ardemyacademy";

const DAY_NOTES: Record<number, string> = {
  1: "Bugünkü harflerin hepsi Türkçedeki sesine yakın.",
  2: "Dikkat: В, Н, Р, С Latin harflerine benzer ama farklı okunur!",
  3: "У = u, Х = h (boğazdan). Latin Y ve X'e benzer ama farklı!",
  4: "Й kısa i'dir: май = may.",
  5: "Ц, Ч, Ш, Щ Türkçede ts, ç, ş, şç sesleridir.",
  6: "Ы = ı (kalın i), Ю = yu, Я = ya.",
  7: "Ь ve Ъ ses vermez; Ё = yo. Alfabe tamam!",
};

async function main() {
  // Tanıtım
  const d0 = join(OUT, "0-Tanitim");
  await put(
    d0,
    "1-FEED-challenge-basliyor.png",
    await png(info({ emoji: "🇷🇺", title: "7 günde Rusça alfabe", lines: ["Her gün 4-5 harf", "Challenge başlıyor! 👉"], footer: "Ardemy Academy", titleSize: 84 }), SQ)
  );
  await put(d0, "NOT.txt", [
    "TANITIM GÖNDERİSİ (challenge başlamadan 1 gün önce ya da ilk gün)",
    "",
    "Açıklama:",
    "7 günde Rusça alfabe challenge başlıyor! 🇷🇺",
    "Her gün 4-5 harf öğreneceğiz. 7 günün sonunda 33 harfi tanıyor olacaksın.",
    "Katılmak için her gün gönderiyi kaydet ve altına ✅ bırak.",
    "",
    `📌 Tüm alfabe ve ücretsiz poster: ${LINK}`,
    FOLLOW,
    "",
    HASH,
  ].join("\n"));

  // 7 günlük kartlar
  for (let day = 1; day <= 7; day++) {
    const letters = lettersForDay(day);
    const build: Build = function Day({ size, logo }) {
      return (
        <LessonSlide
          size={size}
          logo={logo}
          step={day}
          total={7}
          chip={`Rusça Alfabe · Gün ${day}/7`}
          heading="Bugünün harfleri"
          rows={letters.map((l) => ({
            left: `${l.upper} ${l.lower}  (${l.sound === "-" ? "okunmaz" : l.sound})`,
            right: `${l.example}: ${l.meaning}`,
          }))}
          note={DAY_NOTES[day]}
          footer="Kaydet ve her gün tekrar bak"
        />
      );
    };
    const dir = join(OUT, `${day}-Gun`);
    await put(dir, "1-FEED-gunun-harfleri.png", await png(build, SQ));
    const list = letters.map((l) => `${l.upper} ${l.lower} = ${l.sound === "-" ? "okunmaz" : l.sound} (${l.example}: ${l.meaning})`);
    await put(dir, "NOT.txt", [
      `GÜN ${day}/7 — Rusça Alfabe Challenge`,
      "",
      "FEED (19:00-21:00 arası): 1-FEED-gunun-harfleri.png",
      "Açıklama:",
      `Rusça alfabe challenge · Gün ${day}/7 🇷🇺`,
      "Bugünün harfleri:",
      ...list,
      "",
      DAY_NOTES[day],
      day < 7
        ? `Yarın görüşürüz! Bugünü tamamladıysan yorumlara ✅ bırak.`
        : "7 günü tamamladın, tebrikler! 🎉 Tüm alfabeyi ve ücretsiz posteri aşağıdaki linkte bulabilirsin.",
      "",
      `📌 Tüm alfabe: ${LINK}`,
      FOLLOW,
      "",
      HASH,
      "",
      "HİKÂYE (isteğe bağlı): Aynı görseli hikâyeye ekle, üstüne \"Test\" çıkartmasıyla bugünün harflerinden bir soru sor.",
    ].join("\n"));
  }

  // Poster
  const { fonts, logo } = await getOgAssets();
  const poster = Buffer.from(
    await new ImageResponse(<AlphabetPoster logo={logo} />, { ...POSTER_SIZE, fonts }).arrayBuffer()
  );
  const d8 = join(OUT, "8-Poster-7-Gun-Sonunda");
  await put(d8, "rusca-alfabe-posteri.png", poster);
  await put(d8, "NOT.txt", [
    "7. GÜNÜN ARDINDAN: tüm alfabe posteri",
    "",
    "• Hikâye olarak paylaşabilirsin (görsel dikey, kenarlarda boşluk kalır).",
    "• Feed'de 4:5 oranına kırpılacağı için posteri feed'e koyma; onun yerine linke yönlendir:",
    `  ${LINK} (sayfada \"Posteri indir\" düğmesi var)`,
    "• Açıklama önerisi: \"7 günde alfabeyi bitirdik! 🎉 33 harflik posteri ücretsiz indir: profildeki link > Rusça alfabe\"",
    FOLLOW,
  ].join("\n"));

  await put(OUT, "OKU-BENI.txt", [
    "ARDEMY INSTAGRAM — 7 GÜNDE RUSÇA ALFABE CHALLENGE",
    "",
    "Tanıtım gönderisi + 7 günlük gönderi + 33 harflik poster.",
    "Önerilen kullanım: Challenge'ı art arda 7 gün boyunca, günün sorusu paylaşımına ek olarak yap (günde bir gönderi daha).",
    "Her gün klasörünün içindeki NOT.txt'de açıklama metni var.",
    "",
    "Günlere göre harfler:",
    "1: А К М О Т   2: В Е Н Р С   3: Б Г Д У Х   4: З И Й Л П   5: Ф Ц Ч Ш Щ   6: Ж Ы Э Ю Я   7: Ё Ъ Ь",
  ].join("\n"));

  console.log("Alfabe challenge paketi hazır:", OUT);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
