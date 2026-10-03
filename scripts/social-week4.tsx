// Kullanım:
//   DATABASE_URL=... npx tsx scripts/social-week4.tsx "<çıktı-klasörü>" "<ffmpeg-yolu>"
//
// 4. haftanın (26 Ekim - 1 Kasım 2026) Instagram içeriğini gün gün klasörler
// halinde üretir. Sorular sabit id ile seçilir.

import "dotenv/config";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { prisma } from "../src/lib/prisma";
import { LessonSlide } from "../src/lib/og/cards-extra";
import { buildSocialCaption } from "../src/lib/social-question";
import { INSTAGRAM_HANDLE, SITE_URL } from "../src/lib/site";
import {
  answerLine,
  info,
  loadQuestion,
  makeReels,
  png,
  put,
  questionBuild,
  SQ,
  ST,
  wordFrame,
  type Build,
} from "./lib/social-kit";

const [OUT, FFMPEG] = process.argv.slice(2);
if (!OUT || !FFMPEG) {
  console.error("Kullanım: social-week4.tsx <çıktı> <ffmpeg>");
  process.exit(1);
}

const FOLLOW = `📲 Takip et: ${INSTAGRAM_HANDLE}`;
const HASH_EN = "#ingilizce #ingilizceöğreniyorum #ingilizcegramer #dilöğrenme #ardemyacademy";
const LINK_EN = `${SITE_URL}/dene/ingilizce`;
const LINK_ANY = `${SITE_URL}/dene`;

const Q_MON = { id: "cms1vg6l50006qww7xgqpipi6", language: "Rusça" };
const Q_TUE = { id: "cms55h4ah000tcsw72w7k4kgc", language: "İngilizce" };
const Q_SAT = { id: "cms55sze60010dww7yh922qxo", language: "İngilizce" };

async function main() {
  const qMon = await loadQuestion(Q_MON.id);
  const qTue = await loadQuestion(Q_TUE.id);
  const qSat = await loadQuestion(Q_SAT.id);

  // ── Pazartesi 26 Ekim ──
  const d1 = join(OUT, "1-Pazartesi-26-Ekim");
  await put(d1, "1-FEED-rusca-soru.png", await png(questionBuild(qMon, Q_MON.language, false), SQ));
  await put(
    d1,
    "2-HIKAYE-hangi-konuda-zorlaniyorsun.png",
    await png(info({ emoji: "🙋", title: "Hangi konuda zorlanıyorsun?", lines: ["Soru çıkartmasına yaz", "Sıradaki mini dersi sen seç!"], footer: "Rusça ve İngilizce", titleSize: 76 }), ST)
  );
  await put(d1, "NOT.txt", [
    "PAZARTESİ 26 EKİM — Günün Rusça Sorusu",
    "",
    "1) FEED (19:00-21:00 arası): 1-FEED-rusca-soru.png",
    `   ${answerLine(qMon)}`,
    "   Açıklama:",
    buildSocialCaption(Q_MON.language, qMon),
    "",
    "2) HİKÂYE: 2-HIKAYE-hangi-konuda-zorlaniyorsun.png — üstüne \"Soru sor\" çıkartması ekle.",
    "   Gelen cevaplar bir sonraki ayın mini ders konularını belirlemene yarar; bana da iletebilirsin.",
  ].join("\n"));

  // ── Salı 27 Ekim ──
  const d2 = join(OUT, "2-Sali-27-Ekim");
  await put(d2, "1-FEED-ingilizce-soru.png", await png(questionBuild(qTue, Q_TUE.language, false), SQ));
  await put(d2, "2-HIKAYE-dunku-rusca-cevap.png", await png(questionBuild(qMon, Q_MON.language, true), ST));
  await put(d2, "NOT.txt", [
    "SALI 27 EKİM — Günün İngilizce Sorusu",
    "",
    "1) FEED (19:00-21:00 arası): 1-FEED-ingilizce-soru.png",
    `   ${answerLine(qTue)}`,
    "   Açıklama:",
    buildSocialCaption(Q_TUE.language, qTue),
    "",
    "2) HİKÂYE: 2-HIKAYE-dunku-rusca-cevap.png (dünkü Rusça sorunun cevabı)",
  ].join("\n"));

  // ── Çarşamba 28 Ekim: Mini Ders (in / on / at) ──
  const d3 = join(OUT, "3-Carsamba-28-Ekim");
  const slides: Build[] = [
    info({ emoji: "✅", title: "in, on, at: bir daha karıştırmayacaksın", lines: ["İngilizce edatlar", "Kaydır 👉"], footer: "Mini Ders", titleSize: 70 }),
    function S2({ size, logo }) {
      return (
        <LessonSlide
          size={size}
          logo={logo}
          step={2}
          total={5}
          heading="AT: saat ve nokta"
          rows={[
            { left: "at 5 o'clock", right: "saat 5'te" },
            { left: "at night", right: "geceleyin" },
            { left: "at the airport", right: "havalimanında" },
            { left: "at home", right: "evde" },
          ]}
          note="Küçük, belirli bir nokta için AT kullanılır."
        />
      );
    },
    function S3({ size, logo }) {
      return (
        <LessonSlide
          size={size}
          logo={logo}
          step={3}
          total={5}
          heading="ON: gün, tarih ve yüzey"
          rows={[
            { left: "on Monday", right: "pazartesi günü" },
            { left: "on 5 May", right: "5 Mayıs'ta" },
            { left: "on the table", right: "masanın üstünde" },
            { left: "on the bus", right: "otobüste" },
          ]}
          note="Gün ve tarih için ON; yüzeyin üstü için de ON."
        />
      );
    },
    function S4({ size, logo }) {
      return (
        <LessonSlide
          size={size}
          logo={logo}
          step={4}
          total={5}
          heading="IN: ay, yıl ve kapalı alan"
          rows={[
            { left: "in October", right: "Ekim ayında" },
            { left: "in 2026", right: "2026 yılında" },
            { left: "in the box", right: "kutunun içinde" },
            { left: "in Istanbul", right: "İstanbul'da" },
          ]}
          note="Geniş zaman ve alanlar için IN kullanılır."
        />
      );
    },
    info({ emoji: "🤔", title: "Sıra sende!", lines: ["My birthday is ___ 12 March.", "in mi, on mu, at mi? Yorumlara yaz 👇"], footer: "Cevap Perşembe günü hikâyede" }),
  ];
  for (let i = 0; i < slides.length; i++) {
    await put(d3, `1-FEED-mini-ders-slayt-${i + 1}.png`, await png(slides[i], SQ));
  }
  await put(d3, "2-HIKAYE-dunku-ingilizce-cevap.png", await png(questionBuild(qTue, Q_TUE.language, true), ST));
  await put(d3, "NOT.txt", [
    "ÇARŞAMBA 28 EKİM — Mini Ders: in / on / at",
    "",
    "1) FEED (kaydırmalı gönderi): Instagram'da + > Gönderi > \"Birden fazla seç\" ve 1-FEED-mini-ders-slayt-1...5 dosyalarını SIRAYLA seç.",
    "   Açıklama:",
    "in, on, at: bir daha karıştırmayacaksın ✅",
    "AT: saat ve nokta · ON: gün, tarih ve yüzey · IN: ay, yıl ve kapalı alan",
    "Kaydet, sonra tekrar bak 📌",
    "",
    "Sıra sende: \"My birthday is ___ 12 March.\" in mi, on mu, at mi? Yorumlara yaz 👇 (Cevabı Perşembe günü hikâyede!)",
    "",
    `🎁 Ücretsiz dene: ${LINK_EN}`,
    FOLLOW,
    "",
    HASH_EN,
    "",
    "2) HİKÂYE: 2-HIKAYE-dunku-ingilizce-cevap.png (dünkü İngilizce sorunun cevabı)",
  ].join("\n"));

  // ── Perşembe 29 Ekim: Reels (yanıltıcı kelimeler) ──
  const d4 = join(OUT, "4-Persembe-29-Ekim");
  await mkdir(d4, { recursive: true });
  const falseFriends: [string, string, string][] = [
    ["actually", "aslında", "aktüel DEĞİL ❌"],
    ["eventually", "sonunda", "eventüel (olası) DEĞİL ❌"],
    ["sympathetic", "anlayışlı", "sempatik DEĞİL ❌"],
    ["sensible", "mantıklı", "hassas DEĞİL ❌"],
  ];
  await makeReels({
    ffmpeg: FFMPEG,
    outFile: join(d4, "1-REELS-yaniltici-kelimeler.mp4"),
    title: info({ emoji: "😳", title: "Türkçeye benziyor ama değil!", lines: ["4 yanıltıcı İngilizce kelime"], footer: "Ardemy Academy", titleSize: 72 }),
    titleSec: 2,
    words: falseFriends.map(([word, meaning, note]) => ({
      build: wordFrame({ topic: "Yanıltıcı kelimeler", word, meaning, note }),
      sec: 2.75,
    })),
    outro: info({ emoji: "💬", title: "Sen hangisini karıştırdın?", lines: ["Yorumlara yaz 👇", "Ücretsiz test: profildeki link"], footer: "Takip et, her gün yeni soru", titleSize: 72 }),
    outroSec: 2,
  });
  await put(
    d4,
    "2-HIKAYE-mini-ders-cevabi.png",
    await png(info({ emoji: "✅", title: "My birthday is on 12 March.", lines: ["Gün ve tarih için ON kullanılır", "Doğru bildin mi? 👏"], footer: "Dünkü mini ders sorusunun cevabı", titleSize: 70 }), ST)
  );
  await put(
    d4,
    "3-HIKAYE-anket-in-on-at.png",
    await png(info({ emoji: "🗳️", title: "Hangi edat seni en çok zorluyor?", lines: ["in / on / at"], footer: "Anketi oyla", titleSize: 72 }), ST)
  );
  await put(d4, "NOT.txt", [
    "PERŞEMBE 29 EKİM — Reels: Türkçeye benziyor ama değil! (15 saniye)",
    "",
    "1) REELS: Instagram'da + > Reels > galeriden 1-REELS-yaniltici-kelimeler.mp4 seç > İstersen hafif, sözsüz bir müzik ekle > Paylaş.",
    "   Açıklama:",
    "Türkçeye benziyor ama aynı anlama gelmiyor! 😳",
    "actually = aslında (aktüel DEĞİL)",
    "eventually = sonunda (eventüel DEĞİL)",
    "sympathetic = anlayışlı (sempatik DEĞİL)",
    "sensible = mantıklı (hassas DEĞİL)",
    "Sen hangisini karıştırdın? Yorumlara yaz 👇",
    "Kaydet, sonra tekrar bak 📌",
    "",
    `🎁 Ücretsiz dene: ${LINK_EN}`,
    FOLLOW,
    "",
    HASH_EN,
    "",
    "2) HİKÂYE: 2-HIKAYE-mini-ders-cevabi.png (çarşamba mini ders sorusunun cevabı)",
    "3) HİKÂYE: 3-HIKAYE-anket-in-on-at.png — üstüne \"Anket\" çıkartması ekle (in / on / at).",
  ].join("\n"));

  // ── Cuma 30 Ekim: Tanıtım (Arkadaşını getir) ──
  const d5 = join(OUT, "5-Cuma-30-Ekim");
  await put(
    d5,
    "1-FEED-arkadasini-getir-tanitim.png",
    await png(info({
      emoji: "🎁",
      title: "Arkadaşını getir, ikiniz kazanın!",
      lines: ["Kayıt olana 2 kredi hediye", "Arkadaşın ilk kredi paketini alınca ikinize de 3'er kredi"],
      footer: "Profildeki linkten kayıt ol",
      titleSize: 72,
    }), SQ)
  );
  await put(
    d5,
    "2-HIKAYE-arkadasini-davet-et.png",
    await png(info({
      emoji: "💌",
      title: "Arkadaşını davet et",
      lines: ["Panelde \"Arkadaşını Getir\" kartından linkini kopyala", "WhatsApp'tan gönder"],
      footer: "Birlikte çalışın, birlikte kazanın",
      titleSize: 76,
    }), ST)
  );
  await put(d5, "NOT.txt", [
    "CUMA 30 EKİM — Platform tanıtımı: Arkadaşını getir",
    "",
    "1) FEED (19:00-21:00 arası): 1-FEED-arkadasini-getir-tanitim.png",
    "   Açıklama:",
    "Arkadaşını getir, ikiniz de kazanın! 🎁",
    "Kayıt olana 2 kredi hediye. Arkadaşın ilk kredi paketini alınca ikinize de 3'er kredi eklenir.",
    "Linkini panelde \"Arkadaşını Getir\" kartında bulabilirsin.",
    "",
    `Ücretsiz dene: ${LINK_ANY}`,
    FOLLOW,
    "",
    "#dilöğrenme #rusça #ingilizce #ardemyacademy",
    "",
    "2) HİKÂYE: 2-HIKAYE-arkadasini-davet-et.png",
    "   Öğrencilerin seni etiketlediği hikâyeleri kendi hikâyene ekle.",
  ].join("\n"));

  // ── Cumartesi 31 Ekim: Haftanın Zor Sorusu (İngilizce) ──
  const d6 = join(OUT, "6-Cumartesi-31-Ekim");
  await put(d6, "1-FEED-haftanin-zor-sorusu.png", await png(questionBuild(qSat, Q_SAT.language, false, "Haftanın Zor Sorusu"), SQ));
  await put(
    d6,
    "2-HIKAYE-cevap-yarin.png",
    await png(info({ emoji: "⏳", title: "Haftanın zor sorusunu çözdün mü?", lines: ["Cevap yarın hikâyede!", "Cevabını gönderiye yaz 👇"], footer: "Cumartesi gönderisine bak", titleSize: 72 }), ST)
  );
  await put(d6, "NOT.txt", [
    "CUMARTESİ 31 EKİM — Haftanın Zor Sorusu (İngilizce, Passive)",
    "",
    "1) FEED (19:00-21:00 arası): 1-FEED-haftanin-zor-sorusu.png",
    `   ${answerLine(qSat)}`,
    "   Açıklama:",
    [
      "🧠 Haftanın zor sorusu!",
      "",
      qSat.prompt,
      ...qSat.options.map((o, i) => `${"ABCD"[i]}) ${o}`),
      "",
      "Cevabını yorumlara yaz 👇 Doğru cevap yarın hikayemizde!",
      "",
      `🎁 Ücretsiz dene: ${LINK_EN}`,
      FOLLOW,
      "",
      HASH_EN,
    ].join("\n"),
    "",
    "2) HİKÂYE: 2-HIKAYE-cevap-yarin.png — üstüne \"Soru sor\" ya da \"Test\" çıkartması eklemek isteyebilirsin.",
  ].join("\n"));

  // ── Pazar 1 Kasım ──
  const d7 = join(OUT, "7-Pazar-1-Kasim");
  await put(d7, "1-HIKAYE-zor-sorunun-cevabi.png", await png(questionBuild(qSat, Q_SAT.language, true, "Haftanın Zor Sorusu"), ST));
  await put(d7, "NOT.txt", [
    "PAZAR 1 KASIM — Dinlenme günü (feed yok)",
    "",
    "1) HİKÂYE: 1-HIKAYE-zor-sorunun-cevabi.png (dünkü zor sorunun cevabı)",
    "2) HİKÂYE (kendin yaz): haftanın özeti. Örnek:",
    "   \"Bu hafta in/on/at ve yanıltıcı kelimeleri gördük! 🙏",
    "    Yeni hafta, yeni sorular. Takipte kal!\"",
    "",
    "30 GÜNLÜK PLANIN SONU YAKLAŞIYOR:",
    "• 2 Kasım Pazartesi (29. gün) Rusça soru, 3 Kasım Salı (30. gün) İngilizce soru + \"Bir ayı bitirdik\" hikâyesi.",
    "• Bu iki günün paketini ve ikinci ayın takvimini bana yaz; Insights verilerine göre hazırlayayım.",
    "• Insights'ta 4 haftanın en çok kaydedilen/paylaşılan gönderilerini not et.",
  ].join("\n"));

  await put(OUT, "OKU-BENI.txt", [
    "ARDEMY INSTAGRAM — 4. HAFTA PAKETİ (26 Ekim - 1 Kasım)",
    "",
    "Her gün için bir klasör var. Dosyalar paylaşım sırasıyla numaralı; NOT.txt'de açıklamalar ve hikâyelere eklenecek çıkartmalar yazıyor.",
    "",
    "Pazartesi 26 Ekim : Rusça soru + hikâye",
    "Salı 27 Ekim      : İngilizce soru + hikâye",
    "Çarşamba 28 Ekim  : Mini Ders (in / on / at, 5 slayt) + hikâye",
    "Perşembe 29 Ekim  : Reels (yanıltıcı kelimeler) + 2 hikâye",
    "Cuma 30 Ekim      : Arkadaşını getir tanıtımı + hikâye",
    "Cumartesi 31 Ekim : Haftanın zor sorusu (İngilizce) + hikâye",
    "Pazar 1 Kasım     : Dinlenme + cevap hikâyesi",
    "",
    "Saat: akşam 19:00-21:00 arası paylaşmak genelde iyi sonuç verir.",
  ].join("\n"));

  console.log("4. hafta paketi hazır:", OUT);
  await prisma.$disconnect();
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
