// Kullanım:
//   DATABASE_URL=... npx tsx scripts/social-week3.tsx "<çıktı-klasörü>" "<ffmpeg-yolu>"
//
// 3. haftanın (19-25 Ekim 2026) Instagram içeriğini gün gün klasörler halinde
// üretir. Sorular sabit id ile seçilir.

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
  console.error("Kullanım: social-week3.tsx <çıktı> <ffmpeg>");
  process.exit(1);
}

const FOLLOW = `📲 Takip et: ${INSTAGRAM_HANDLE}`;
const HASH_RU = "#rusça #rusçaöğreniyorum #rusçakelimeler #dilöğrenme #ardemyacademy";
const LINK_RU = `${SITE_URL}/dene/rusca`;
const LINK_ANY = `${SITE_URL}/dene`;

const Q_MON = { id: "cms1vpkzi0008i8w7xosoqat0", language: "Rusça" };
const Q_TUE = { id: "cms55sze60014dww7mj3wf3w3", language: "İngilizce" };
const Q_SAT = { id: "cms1xdd9v00083gw74ow63kvt", language: "Rusça" };

async function main() {
  const qMon = await loadQuestion(Q_MON.id);
  const qTue = await loadQuestion(Q_TUE.id);
  const qSat = await loadQuestion(Q_SAT.id);

  // ── Pazartesi 19 Ekim ──
  const d1 = join(OUT, "1-Pazartesi-19-Ekim");
  await put(d1, "1-FEED-rusca-soru.png", await png(questionBuild(qMon, Q_MON.language, false), SQ));
  await put(
    d1,
    "2-HIKAYE-pazartesi-motivasyon.png",
    await png(info({ emoji: "💪", title: "Pazartesi motivasyonu", lines: ["Bugün kaç soru çözeceksin?", "Kaydırıcıyı oynat 👇"], footer: "Her gün 1 soru çöz" }), ST)
  );
  await put(d1, "NOT.txt", [
    "PAZARTESİ 19 EKİM — Günün Rusça Sorusu",
    "",
    "1) FEED (19:00-21:00 arası): 1-FEED-rusca-soru.png",
    `   ${answerLine(qMon)}`,
    "   Açıklama:",
    buildSocialCaption(Q_MON.language, qMon),
    "",
    "2) HİKÂYE: 2-HIKAYE-pazartesi-motivasyon.png — üstüne \"Emoji kaydırıcı\" çıkartması ekle (💪 seç).",
  ].join("\n"));

  // ── Salı 20 Ekim ──
  const d2 = join(OUT, "2-Sali-20-Ekim");
  await put(d2, "1-FEED-ingilizce-soru.png", await png(questionBuild(qTue, Q_TUE.language, false), SQ));
  await put(d2, "2-HIKAYE-dunku-rusca-cevap.png", await png(questionBuild(qMon, Q_MON.language, true), ST));
  await put(d2, "NOT.txt", [
    "SALI 20 EKİM — Günün İngilizce Sorusu",
    "",
    "1) FEED (19:00-21:00 arası): 1-FEED-ingilizce-soru.png",
    `   ${answerLine(qTue)}`,
    "   Açıklama:",
    buildSocialCaption(Q_TUE.language, qTue),
    "",
    "2) HİKÂYE: 2-HIKAYE-dunku-rusca-cevap.png (dünkü Rusça sorunun cevabı)",
  ].join("\n"));

  // ── Çarşamba 21 Ekim: Mini Ders (Rusça 6 hal) ──
  const d3 = join(OUT, "3-Carsamba-21-Ekim");
  const slides: Build[] = [
    info({ emoji: "🇷🇺", title: "Rusçada 6 hal tek bakışta", lines: ["Падежи: isim ekleri", "Kaydır 👉"], footer: "Mini Ders", titleSize: 76 }),
    function S2({ size, logo }) {
      return (
        <LessonSlide
          size={size}
          logo={logo}
          step={2}
          total={5}
          heading="Hâller 1-3"
          rows={[
            { left: "книга", right: "Yalın hâl: kim? ne?" },
            { left: "у меня нет книги", right: "-İn hali: kimin? yok" },
            { left: "я даю книгу брату", right: "-E hali: kime? (брату)" },
          ]}
          note="Rusçada isim, cümledeki göreve göre ekini değiştirir."
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
          heading="Hâller 4-6"
          rows={[
            { left: "я читаю книгу", right: "-İ hali: neyi? (книгу)" },
            { left: "с другом", right: "-İle hali: kiminle?" },
            { left: "в школе", right: "-De hali: nerede?" },
          ]}
          note="Şimdilik ezberlemeye çalışma: önce örnekleri tanı."
        />
      );
    },
    info({ emoji: "🤔", title: "Sıra sende!", lines: ["Okula gidiyorum: Я иду в ___", "школе mi, школу mu? Yorumlara yaz 👇"], footer: "Cevap Perşembe günü hikâyede" }),
    info({ emoji: "🎁", title: "Daha fazla Rusça test", lines: ["Profildeki linke tıkla", "Kayıt olmadan 5 soruluk test çöz"], footer: "Ücretsiz dene" }),
  ];
  for (let i = 0; i < slides.length; i++) {
    await put(d3, `1-FEED-mini-ders-slayt-${i + 1}.png`, await png(slides[i], SQ));
  }
  await put(d3, "2-HIKAYE-dunku-ingilizce-cevap.png", await png(questionBuild(qTue, Q_TUE.language, true), ST));
  await put(d3, "NOT.txt", [
    "ÇARŞAMBA 21 EKİM — Mini Ders: Rusçada 6 hal tek bakışta",
    "",
    "1) FEED (kaydırmalı gönderi): Instagram'da + > Gönderi > \"Birden fazla seç\" ve 1-FEED-mini-ders-slayt-1...5 dosyalarını SIRAYLA seç.",
    "   Açıklama:",
    "Rusçada 6 hal tek bakışta 🇷🇺",
    "Kaydet, sonra tekrar bak 📌",
    "",
    "Sıra sende: \"Okula gidiyorum\" = Я иду в ___ (школе mi, школу mu?) Yorumlara yaz 👇 (Cevabı Perşembe günü hikâyede!)",
    "",
    `🎁 Ücretsiz dene: ${LINK_RU}`,
    FOLLOW,
    "",
    HASH_RU,
    "",
    "2) HİKÂYE: 2-HIKAYE-dunku-ingilizce-cevap.png (dünkü İngilizce sorunun cevabı)",
  ].join("\n"));

  // ── Perşembe 22 Ekim: Reels (restoran kalıpları) ──
  const d4 = join(OUT, "4-Persembe-22-Ekim");
  await mkdir(d4, { recursive: true });
  const phrases: [string, string, string][] = [
    ["Можно меню?", "Menü alabilir miyim?", "mojna menyu"],
    ["Очень вкусно", "Çok lezzetli", "oçen fkusna"],
    ["Приятного аппетита", "Afiyet olsun", "priyatnava apetita"],
    ["Счёт, пожалуйста", "Hesap lütfen", "şçot, pajalusta"],
    ["Спасибо", "Teşekkürler", "spasiba"],
  ];
  await makeReels({
    ffmpeg: FFMPEG,
    outFile: join(d4, "1-REELS-rusca-restoran-kaliplari.mp4"),
    title: info({ emoji: "🍽️", title: "Rusya'da restoranda", lines: ["5 cümle, 15 saniye"], footer: "Ardemy Academy", titleSize: 80 }),
    titleSec: 2,
    words: phrases.map(([word, meaning, reading]) => ({
      build: wordFrame({ topic: "Rusça restoran kalıpları", word, meaning, reading }),
      sec: 2.2,
    })),
    outro: info({ emoji: "💬", title: "Hangisini ilk kullanırsın?", lines: ["Yorumlara yaz 👇", "Ücretsiz test: profildeki link"], footer: "Takip et, her gün yeni soru", titleSize: 72 }),
    outroSec: 2,
  });
  await put(
    d4,
    "2-HIKAYE-mini-ders-cevabi.png",
    await png(info({ emoji: "✅", title: "Я иду в школу", lines: ["Yön (nereye?): -İ hali, школу", "Yer (nerede?): -De hali, в школе", "Doğru bildin mi? 👏"], footer: "Dünkü mini ders sorusunun cevabı", titleSize: 76 }), ST)
  );
  await put(
    d4,
    "3-HIKAYE-anket-pelmeni-mi-bors-mu.png",
    await png(info({ emoji: "🍲", title: "Pelmeni mi, borş mu?", lines: ["Rusya'da ilk neyi denerdin?"], footer: "Anketi oyla" }), ST)
  );
  await put(d4, "NOT.txt", [
    "PERŞEMBE 22 EKİM — Reels: Rusya'da restoranda 5 cümle (15 saniye)",
    "",
    "1) REELS: Instagram'da + > Reels > galeriden 1-REELS-rusca-restoran-kaliplari.mp4 seç > İstersen hafif, sözsüz bir müzik ekle > Paylaş.",
    "   Açıklama:",
    "Rusya'da restorana gidiyorsan bu 5 cümleyi bil! 🍽️",
    "Можно меню? = Menü alabilir miyim?",
    "Очень вкусно = Çok lezzetli",
    "Приятного аппетита = Afiyet olsun",
    "Счёт, пожалуйста = Hesap lütfen",
    "Спасибо = Teşekkürler",
    "Hangisini ilk kullanırsın? Yorumlara yaz 👇",
    "Kaydet, sonra tekrar bak 📌",
    "",
    `🎁 Ücretsiz dene: ${LINK_RU}`,
    FOLLOW,
    "",
    HASH_RU,
    "",
    "2) HİKÂYE: 2-HIKAYE-mini-ders-cevabi.png (çarşamba mini ders sorusunun cevabı)",
    "3) HİKÂYE: 3-HIKAYE-anket-pelmeni-mi-bors-mu.png — üstüne \"Anket\" çıkartması ekle (Pelmeni / Borş).",
  ].join("\n"));

  // ── Cuma 23 Ekim: Tanıtım (rozetler ve mağaza) ──
  const d5 = join(OUT, "5-Cuma-23-Ekim");
  await put(
    d5,
    "1-FEED-rozetler-ve-magaza-tanitim.png",
    await png(info({
      emoji: "🏅",
      title: "24 rozet seni bekliyor!",
      lines: ["Kazandıkça unvan ve çerçeve al", "Kelime Avcısı, Polyglot, Efsane ve daha fazlası"],
      footer: "Profildeki linkten dene",
    }), SQ)
  );
  await put(
    d5,
    "2-HIKAYE-rozetini-paylas.png",
    await png(info({
      emoji: "📤",
      title: "Rozetini hikâyende paylaş!",
      lines: ["Paneldeki \"Paylaş\" düğmesine bas", `Beni etiketle: ${INSTAGRAM_HANDLE}`],
      footer: "Etiketlenen hikâyeleri paylaşıyorum",
      titleSize: 72,
    }), ST)
  );
  await put(d5, "NOT.txt", [
    "CUMA 23 EKİM — Platform tanıtımı: Rozetler ve mağaza",
    "",
    "1) FEED (19:00-21:00 arası): 1-FEED-rozetler-ve-magaza-tanitim.png",
    "   Açıklama:",
    "24 rozet seni bekliyor! 🏅",
    "Soru çözdükçe, seri yaptıkça rozet kazan; kredinle unvan ve profil çerçevesi al: Kelime Avcısı, Polyglot, Efsane…",
    "Hangisini ilk alırdın? Yorumlara yaz 👇",
    "",
    `🎁 Ücretsiz dene: ${LINK_ANY}`,
    FOLLOW,
    "",
    "#dilöğrenme #rusça #ingilizce #ardemyacademy",
    "",
    "2) HİKÂYE: 2-HIKAYE-rozetini-paylas.png",
    "   Öğrencilerin seni etiketlediği hikâyeleri kendi hikâyene ekle; bu paylaşımlar en iyi tanıtımdır.",
  ].join("\n"));

  // ── Cumartesi 24 Ekim: Haftanın Zor Sorusu (Rusça) ──
  const d6 = join(OUT, "6-Cumartesi-24-Ekim");
  await put(d6, "1-FEED-haftanin-zor-sorusu.png", await png(questionBuild(qSat, Q_SAT.language, false, "Haftanın Zor Sorusu"), SQ));
  await put(
    d6,
    "2-HIKAYE-cevap-yarin.png",
    await png(info({ emoji: "⏳", title: "Haftanın zor sorusunu çözdün mü?", lines: ["Cevap yarın hikâyede!", "Cevabını gönderiye yaz 👇"], footer: "Cumartesi gönderisine bak", titleSize: 72 }), ST)
  );
  await put(d6, "NOT.txt", [
    "CUMARTESİ 24 EKİM — Haftanın Zor Sorusu (Rusça, -De hali)",
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
      `🎁 Ücretsiz dene: ${LINK_RU}`,
      FOLLOW,
      "",
      HASH_RU,
    ].join("\n"),
    "",
    "2) HİKÂYE: 2-HIKAYE-cevap-yarin.png — üstüne \"Soru sor\" ya da \"Test\" çıkartması eklemek isteyebilirsin.",
  ].join("\n"));

  // ── Pazar 25 Ekim ──
  const d7 = join(OUT, "7-Pazar-25-Ekim");
  await put(d7, "1-HIKAYE-zor-sorunun-cevabi.png", await png(questionBuild(qSat, Q_SAT.language, true, "Haftanın Zor Sorusu"), ST));
  await put(d7, "NOT.txt", [
    "PAZAR 25 EKİM — Dinlenme günü (feed yok)",
    "",
    "1) HİKÂYE: 1-HIKAYE-zor-sorunun-cevabi.png (dünkü zor sorunun cevabı)",
    "2) HİKÂYE (kendin yaz): haftanın özeti. Örnek:",
    "   \"Bu hafta Rusça 6 hali ve restoran kalıplarını gördük! 🙏",
    "    Haftaya: İngilizce edatlar (in/on/at) ve yanıltıcı kelimeler. Takipte kal!\"",
    "",
    "HAFTALIK HAZIRLIK (15 dk):",
    "• 4. hafta: Çarşamba mini ders (in/on/at), Perşembe Reels (yanıltıcı İngilizce kelimeler), Cuma tanıtım (Arkadaşını Getir).",
    "• 4. haftanın paketini bana yaz, hazırlayayım.",
    "• Insights'ta üç haftanın en çok beğenilen gönderisine bak; hangi tür tutuyorsa onu çoğaltalım.",
  ].join("\n"));

  await put(OUT, "OKU-BENI.txt", [
    "ARDEMY INSTAGRAM — 3. HAFTA PAKETİ (19-25 Ekim)",
    "",
    "Her gün için bir klasör var. Dosyalar paylaşım sırasıyla numaralı; NOT.txt'de açıklamalar ve hikâyelere eklenecek çıkartmalar yazıyor.",
    "",
    "Pazartesi 19 Ekim : Rusça soru + hikâye",
    "Salı 20 Ekim      : İngilizce soru + hikâye",
    "Çarşamba 21 Ekim  : Mini Ders (Rusça 6 hal, 5 slayt) + hikâye",
    "Perşembe 22 Ekim  : Reels (Rusça restoran kalıpları) + 2 hikâye",
    "Cuma 23 Ekim      : Rozetler ve mağaza tanıtımı + hikâye",
    "Cumartesi 24 Ekim : Haftanın zor sorusu (Rusça) + hikâye",
    "Pazar 25 Ekim     : Dinlenme + cevap hikâyesi",
    "",
    "Saat: akşam 19:00-21:00 arası paylaşmak genelde iyi sonuç verir.",
  ].join("\n"));

  console.log("3. hafta paketi hazır:", OUT);
  await prisma.$disconnect();
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
