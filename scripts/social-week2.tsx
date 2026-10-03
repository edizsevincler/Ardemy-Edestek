// Kullanım:
//   DATABASE_URL=... npx tsx scripts/social-week2.tsx "<çıktı-klasörü>" "<ffmpeg-yolu>"
//
// 2. haftanın (12-18 Ekim 2026) Instagram içeriğini gün gün klasörler halinde
// üretir. Sorular sabit id ile seçilir (tarihe bağlı rastgelelikten etkilenmez).

import "dotenv/config";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { ReactElement } from "react";
import { ImageResponse } from "next/og";
import { prisma } from "../src/lib/prisma";
import { getOgAssets, OG_FORMATS } from "../src/lib/og/assets";
import { QuestionCard } from "../src/lib/og/cards";
import { InfoCard, LessonSlide, WordFrame } from "../src/lib/og/cards-extra";
import { buildSocialCaption } from "../src/lib/social-question";
import { INSTAGRAM_HANDLE, SITE_URL } from "../src/lib/site";

const [OUT, FFMPEG] = process.argv.slice(2);
if (!OUT || !FFMPEG) {
  console.error("Kullanım: social-week2.tsx <çıktı> <ffmpeg>");
  process.exit(1);
}

const SQ = OG_FORMATS.square;
const ST = OG_FORMATS.story;
const FOLLOW = `📲 Takip et: ${INSTAGRAM_HANDLE}`;
const HASH_EN = "#ingilizce #ingilizceöğreniyorum #ingilizcegramer #dilöğrenme #ardemyacademy";
const LINK_EN = `${SITE_URL}/dene/ingilizce`;
const LINK_ANY = `${SITE_URL}/dene`;

// Haftanın soruları (sabit id)
const Q_MON = { id: "cms1uchbu002b9cw7tv59415c", language: "Rusça" };
const Q_TUE = { id: "cms55kzho001g9ow7j95w0q72", language: "İngilizce" };
const Q_SAT = { id: "cms55pebk000wnow7lw15i9k0", language: "İngilizce" };

type Size = { width: number; height: number };
type Build = (ctx: { size: Size; logo: string }) => ReactElement;

async function png(build: Build, size: Size) {
  const { fonts, logo } = await getOgAssets();
  const res = new ImageResponse(build({ size, logo }), { ...size, fonts });
  return Buffer.from(await res.arrayBuffer());
}

async function put(dir: string, name: string, data: Buffer | string) {
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, name), data);
}

async function loadQuestion(id: string) {
  const q = await prisma.quizItem.findUniqueOrThrow({
    where: { id },
    select: {
      id: true,
      prompt: true,
      optionA: true,
      optionB: true,
      optionC: true,
      optionD: true,
      correct: true,
      question: { select: { subject: true } },
    },
  });
  return {
    id: q.id,
    prompt: q.prompt,
    options: [q.optionA, q.optionB, q.optionC, q.optionD],
    correct: ["A", "B", "C", "D"].indexOf(q.correct),
    subject: q.question.subject,
  };
}

function questionBuild(
  q: Awaited<ReturnType<typeof loadQuestion>>,
  language: string,
  reveal: boolean,
  label?: string
): Build {
  return function QCard({ size, logo }) {
    return (
      <QuestionCard
        size={size}
        logo={logo}
        language={language}
        label={label}
        prompt={q.prompt}
        options={q.options}
        correct={q.correct}
        reveal={reveal}
      />
    );
  };
}

function info(props: {
  emoji: string;
  title: string;
  lines?: string[];
  footer: string;
  titleSize?: number;
}): Build {
  return function Info({ size, logo }) {
    return <InfoCard size={size} logo={logo} {...props} />;
  };
}

async function main() {
  const qMon = await loadQuestion(Q_MON.id);
  const qTue = await loadQuestion(Q_TUE.id);
  const qSat = await loadQuestion(Q_SAT.id);
  const answerLine = (q: typeof qMon) => `Doğru cevap: ${"ABCD"[q.correct]}) ${q.options[q.correct]}`;

  // ── Pazartesi 12 Ekim ──
  const d1 = join(OUT, "1-Pazartesi-12-Ekim");
  await put(d1, "1-FEED-rusca-soru.png", await png(questionBuild(qMon, Q_MON.language, false), SQ));
  await put(
    d1,
    "2-HIKAYE-bu-hafta-hedefin-ne.png",
    await png(info({ emoji: "🎯", title: "Bu hafta hedefin ne?", lines: ["Kaç gün seri yapacaksın?", "Kaydırıcıyı oynat 👇"], footer: "Her gün 1 soru çöz" }), ST)
  );
  await put(d1, "NOT.txt", [
    "PAZARTESİ 12 EKİM — Günün Rusça Sorusu",
    "",
    "1) FEED (19:00-21:00 arası): 1-FEED-rusca-soru.png",
    `   ${answerLine(qMon)}`,
    "   Açıklama:",
    buildSocialCaption(Q_MON.language, qMon),
    "",
    "2) HİKÂYE: 2-HIKAYE-bu-hafta-hedefin-ne.png — üstüne \"Emoji kaydırıcı\" çıkartması ekle (🎯 seç).",
    "",
    "(Pazar günü hikâyesinde zor sorunun cevabı zaten paylaşıldı; bugün için ayrıca cevap hikâyesi yok.)",
  ].join("\n"));

  // ── Salı 13 Ekim ──
  const d2 = join(OUT, "2-Sali-13-Ekim");
  await put(d2, "1-FEED-ingilizce-soru.png", await png(questionBuild(qTue, Q_TUE.language, false), SQ));
  await put(d2, "2-HIKAYE-dunku-rusca-cevap.png", await png(questionBuild(qMon, Q_MON.language, true), ST));
  await put(d2, "NOT.txt", [
    "SALI 13 EKİM — Günün İngilizce Sorusu",
    "",
    "1) FEED (19:00-21:00 arası): 1-FEED-ingilizce-soru.png",
    `   ${answerLine(qTue)}`,
    "   Açıklama:",
    buildSocialCaption(Q_TUE.language, qTue),
    "",
    "2) HİKÂYE: 2-HIKAYE-dunku-rusca-cevap.png (dünkü Rusça sorunun cevabı)",
  ].join("\n"));

  // ── Çarşamba 14 Ekim: Mini Ders (5 slayt) ──
  const d3 = join(OUT, "3-Carsamba-14-Ekim");
  const slides: Build[] = [
    info({ emoji: "🤔", title: "Present Perfect mi, Past Simple mı?", lines: ["İngilizce zamanlar", "Kaydır 👉"], footer: "Mini Ders", titleSize: 72 }),
    function S2({ size, logo }) {
      return (
        <LessonSlide
          size={size}
          logo={logo}
          step={2}
          total={5}
          heading="Zaman belliyse: Past Simple"
          rows={[
            { left: "yesterday", right: "dün" },
            { left: "last year", right: "geçen yıl" },
            { left: "in 2020", right: "2020 yılında" },
            { left: "two days ago", right: "iki gün önce" },
          ]}
          note="I lost my keys yesterday. = Dün anahtarımı kaybettim."
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
          heading="Şimdiyle bağlantı varsa: Present Perfect"
          rows={[
            { left: "already", right: "zaten, çoktan" },
            { left: "yet", right: "henüz" },
            { left: "ever / never", right: "hiç / asla" },
            { left: "just", right: "az önce" },
          ]}
          note="I have lost my keys. = Anahtarımı kaybettim (hâlâ yok)."
        />
      );
    },
    info({ emoji: "🤔", title: "Sıra sende!", lines: ["She ___ to Paris last year.", "went mi, has been mi? Yorumlara yaz 👇"], footer: "Cevap Perşembe günü hikâyede" }),
    info({ emoji: "🎁", title: "Daha fazla İngilizce test", lines: ["Profildeki linke tıkla", "Kayıt olmadan 5 soruluk test çöz"], footer: "Ücretsiz dene" }),
  ];
  for (let i = 0; i < slides.length; i++) {
    await put(d3, `1-FEED-mini-ders-slayt-${i + 1}.png`, await png(slides[i], SQ));
  }
  await put(d3, "2-HIKAYE-dunku-ingilizce-cevap.png", await png(questionBuild(qTue, Q_TUE.language, true), ST));
  await put(d3, "NOT.txt", [
    "ÇARŞAMBA 14 EKİM — Mini Ders: Present Perfect mi, Past Simple mı?",
    "",
    "1) FEED (kaydırmalı gönderi): Instagram'da + > Gönderi > \"Birden fazla seç\" ve 1-FEED-mini-ders-slayt-1...5 dosyalarını SIRAYLA seç.",
    "   Açıklama:",
    "Present Perfect mi, Past Simple mı? 🤔",
    "Zaman belliyse (yesterday, last year, in 2020) → Past Simple.",
    "Şimdiyle bağlantı varsa (already, yet, ever, never, just) → Present Perfect.",
    "Kaydet, sonra tekrar bak 📌",
    "",
    "Sıra sende: \"She ___ to Paris last year.\" went mi, has been mi? Yorumlara yaz 👇 (Cevabı Perşembe günü hikâyede!)",
    "",
    `🎁 Ücretsiz dene: ${LINK_EN}`,
    FOLLOW,
    "",
    HASH_EN,
    "",
    "2) HİKÂYE: 2-HIKAYE-dunku-ingilizce-cevap.png (dünkü İngilizce sorunun cevabı)",
  ].join("\n"));

  // ── Perşembe 15 Ekim: Reels (make / do) ──
  const d4 = join(OUT, "4-Persembe-15-Ekim");
  const words: [string, string, string][] = [
    ["MAKE", "make a decision", "karar vermek"],
    ["MAKE", "make a mistake", "hata yapmak"],
    ["MAKE", "make money", "para kazanmak"],
    ["DO", "do homework", "ödev yapmak"],
    ["DO", "do the dishes", "bulaşık yıkamak"],
    ["DO", "do your best", "elinden geleni yapmak"],
  ];
  const work = await mkdtemp(join(tmpdir(), "ardemy-reels2-"));
  const frames: { file: string; sec: number }[] = [];
  const addFrame = async (name: string, buf: Buffer, sec: number) => {
    const file = join(work, name);
    await writeFile(file, buf);
    frames.push({ file: file.replace(/\\/g, "/"), sec });
  };
  await addFrame("00.png", await png(info({ emoji: "🤔", title: "MAKE mi, DO mu?", lines: ["15 saniyede öğren!"], footer: "Ardemy Academy" }), ST), 2);
  for (let i = 0; i < words.length; i++) {
    const [topic, word, meaning] = words[i];
    await addFrame(
      `${String(i + 1).padStart(2, "0")}.png`,
      await png(function W({ size, logo }) {
        return <WordFrame size={size} logo={logo} topic={topic} word={word} meaning={meaning} />;
      }, ST),
      1.8
    );
  }
  await addFrame("99.png", await png(info({ emoji: "💬", title: "Hangisini hep karıştırıyorsun?", lines: ["Yorumlara yaz 👇", "Ücretsiz test: profildeki link"], footer: "Takip et, her gün yeni soru", titleSize: 72 }), ST), 2.2);
  await writeFile(
    join(work, "list.txt"),
    [
      ...frames.map((f) => `file '${f.file}'\nduration ${f.sec}`),
      `file '${frames[frames.length - 1].file}'`,
    ].join("\n")
  );
  await mkdir(d4, { recursive: true });
  execFileSync(
    FFMPEG,
    [
      "-y", "-loglevel", "error",
      "-f", "concat", "-safe", "0", "-i", join(work, "list.txt"),
      "-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo",
      "-vf", "fps=30,format=yuv420p",
      "-c:v", "libx264", "-preset", "medium", "-crf", "20",
      "-c:a", "aac", "-shortest", "-movflags", "+faststart",
      join(d4, "1-REELS-make-mi-do-mu.mp4"),
    ],
    { stdio: "inherit" }
  );
  await put(
    d4,
    "2-HIKAYE-mini-ders-cevabi.png",
    await png(info({ emoji: "✅", title: "She went to Paris last year.", lines: ["Zaman belli (last year): Past Simple", "Doğru bildin mi? 👏"], footer: "Dünkü mini ders sorusunun cevabı", titleSize: 68 }), ST)
  );
  await put(
    d4,
    "3-HIKAYE-anket-hangisi-daha-zor.png",
    await png(info({ emoji: "🗳️", title: "Hangisi daha zor?", lines: ["Rusça hâller mi, İngilizce zamanlar mı?"], footer: "Anketi oyla" }), ST)
  );
  await put(d4, "NOT.txt", [
    "PERŞEMBE 15 EKİM — Reels: MAKE mi, DO mu? (15 saniye)",
    "",
    "1) REELS: Instagram'da + > Reels > galeriden 1-REELS-make-mi-do-mu.mp4 seç > İstersen hafif, sözsüz bir müzik ekle > Paylaş.",
    "   Açıklama:",
    "MAKE mi DO mu? 🤔",
    "MAKE: make a decision, make a mistake, make money",
    "DO: do homework, do the dishes, do your best",
    "Hangisini hep karıştırıyorsun? Yorumlara yaz 👇",
    "Kaydet, sonra tekrar bak 📌",
    "",
    `🎁 Ücretsiz dene: ${LINK_EN}`,
    FOLLOW,
    "",
    HASH_EN,
    "",
    "2) HİKÂYE: 2-HIKAYE-mini-ders-cevabi.png (çarşamba mini ders sorusunun cevabı)",
    "3) HİKÂYE: 3-HIKAYE-anket-hangisi-daha-zor.png — üstüne \"Anket\" çıkartması ekle (Rusça hâller / İngilizce zamanlar).",
  ].join("\n"));

  // ── Cuma 16 Ekim: Tanıtım (Deneme sınavı) ──
  const d5 = join(OUT, "5-Cuma-16-Ekim");
  await put(
    d5,
    "1-FEED-deneme-sinavi-tanitim.png",
    await png(info({
      emoji: "📝",
      title: "Deneme sınavı geldi!",
      lines: ["20 soru, 20 dakika", "Bitince her sorunun cevabı ve açıklaması", "Kayıt olunca 2 kredi hediye: ilk deneme bedava!"],
      footer: "Profildeki linkten dene",
    }), SQ)
  );
  await put(
    d5,
    "2-HIKAYE-ingilizce-testini-dene.png",
    await png(info({ emoji: "📝", title: "5 soruda İngilizceni dene", lines: ["Kayıt gerekmez", "Linke dokun 👇"], footer: "Ücretsiz test" }), ST)
  );
  await put(d5, "NOT.txt", [
    "CUMA 16 EKİM — Platform tanıtımı: Deneme sınavı",
    "",
    "1) FEED (19:00-21:00 arası): 1-FEED-deneme-sinavi-tanitim.png",
    "   Açıklama:",
    "Deneme sınavı geldi! 📝 20 soru, 20 dakika. Bitince her sorunun doğru cevabı ve kısa açıklaması seni bekliyor.",
    "Kayıt olunca 2 kredi hediye, yani ilk denemen bedava! 🎁",
    "",
    `Ücretsiz dene: ${LINK_ANY}`,
    FOLLOW,
    "",
    "#dilöğrenme #rusça #ingilizce #ardemyacademy",
    "",
    "2) HİKÂYE: 2-HIKAYE-ingilizce-testini-dene.png — üstüne \"Bağlantı\" çıkartması ekle ve şu adresi yaz:",
    `   ${LINK_EN}`,
    "   Öğrenci seni etiketlediyse onun hikâyesini de paylaş.",
  ].join("\n"));

  // ── Cumartesi 17 Ekim: Haftanın Zor Sorusu (İngilizce) ──
  const d6 = join(OUT, "6-Cumartesi-17-Ekim");
  await put(d6, "1-FEED-haftanin-zor-sorusu.png", await png(questionBuild(qSat, Q_SAT.language, false, "Haftanın Zor Sorusu"), SQ));
  await put(
    d6,
    "2-HIKAYE-cevap-yarin.png",
    await png(info({ emoji: "⏳", title: "Haftanın zor sorusunu çözdün mü?", lines: ["Cevap yarın hikâyede!", "Cevabını gönderiye yaz 👇"], footer: "Cumartesi gönderisine bak", titleSize: 72 }), ST)
  );
  await put(d6, "NOT.txt", [
    "CUMARTESİ 17 EKİM — Haftanın Zor Sorusu (İngilizce)",
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

  // ── Pazar 18 Ekim ──
  const d7 = join(OUT, "7-Pazar-18-Ekim");
  await put(d7, "1-HIKAYE-zor-sorunun-cevabi.png", await png(questionBuild(qSat, Q_SAT.language, true, "Haftanın Zor Sorusu"), ST));
  await put(d7, "NOT.txt", [
    "PAZAR 18 EKİM — Dinlenme günü (feed yok)",
    "",
    "1) HİKÂYE: 1-HIKAYE-zor-sorunun-cevabi.png (dünkü zor sorunun cevabı)",
    "2) HİKÂYE (kendin yaz): haftanın özeti. Örnek:",
    "   \"Bu hafta Present Perfect ve make/do'yu konuştuk! 🙏",
    "    Haftaya: Rusça 6 hâl (padej) mini dersi ve restoran kalıpları. Takipte kal!\"",
    "",
    "HAFTALIK HAZIRLIK (15 dk):",
    "• 3. hafta takvimi: Çarşamba mini ders (Rusça 6 hâl), Perşembe Reels (restoran kalıpları), Cuma tanıtım (rozetler ve mağaza).",
    "• 3. haftanın paketini bana yaz, hazırlayayım.",
    "• Insights'ta iki haftanın en çok beğenilen gönderisine bak.",
  ].join("\n"));

  await put(OUT, "OKU-BENI.txt", [
    "ARDEMY INSTAGRAM — 2. HAFTA PAKETİ (12-18 Ekim)",
    "",
    "Her gün için bir klasör var. Dosyalar paylaşım sırasıyla numaralı; NOT.txt'de açıklamalar ve hikâyelere eklenecek çıkartmalar yazıyor.",
    "",
    "Pazartesi 12 Ekim : Rusça soru + hikâye",
    "Salı 13 Ekim      : İngilizce soru + hikâye",
    "Çarşamba 14 Ekim  : Mini Ders (Present Perfect / Past Simple, 5 slayt) + hikâye",
    "Perşembe 15 Ekim  : Reels (make / do) + 2 hikâye",
    "Cuma 16 Ekim      : Deneme sınavı tanıtımı + hikâye",
    "Cumartesi 17 Ekim : Haftanın zor sorusu (İngilizce) + hikâye",
    "Pazar 18 Ekim     : Dinlenme + cevap hikâyesi",
    "",
    "Saat: akşam 19:00-21:00 arası paylaşmak genelde iyi sonuç verir.",
  ].join("\n"));

  console.log("2. hafta paketi hazır:", OUT);
  await prisma.$disconnect();
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
