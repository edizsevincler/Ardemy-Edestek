// Kullanım:
//   DATABASE_URL=... npx tsx scripts/social-week1.tsx "<çıktı-klasörü>" "<paket-klasörü>" "<ffmpeg-yolu>"
//
// İlk haftanın (5-11 Ekim 2026) tüm Instagram içeriğini gün gün klasörler
// halinde üretir: feed/hikâye görselleri, mini ders slaytları, Reels videosu
// ve her gün için açıklama/talimat notu. Paket klasörü, export-social-images
// ile üretilmiş 01-06 numaralı gönderileri (aciklamalar.txt dahil) içerir.

import "dotenv/config";
import { copyFile, mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { ReactElement } from "react";
import { ImageResponse } from "next/og";
import { prisma } from "../src/lib/prisma";
import { getOgAssets, OG_FORMATS } from "../src/lib/og/assets";
import { QuestionCard } from "../src/lib/og/cards";
import { InfoCard, LessonSlide, WordFrame } from "../src/lib/og/cards-extra";
import { SITE_URL } from "../src/lib/site";

const [OUT, PACK, FFMPEG] = process.argv.slice(2);
if (!OUT || !PACK || !FFMPEG) {
  console.error("Kullanım: social-week1.tsx <çıktı> <paket> <ffmpeg>");
  process.exit(1);
}

const SQ = OG_FORMATS.square;
const ST = OG_FORMATS.story;
const HASH_RU = "#rusça #rusçaöğreniyorum #dilöğrenme #ardemyacademy";
const LINK_RU = `${SITE_URL}/dene/rusca`;
const LINK_ANY = `${SITE_URL}/dene`;

type Size = { width: number; height: number };

async function png(build: (ctx: { size: Size; logo: string }) => ReactElement, size: Size) {
  const { fonts, logo } = await getOgAssets();
  const res = new ImageResponse(build({ size, logo }), { ...size, fonts });
  return Buffer.from(await res.arrayBuffer());
}

async function put(dir: string, name: string, data: Buffer | string) {
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, name), data);
}

async function copyFrom(dir: string, name: string, src: string) {
  await mkdir(dir, { recursive: true });
  await copyFile(join(PACK, src), join(dir, name));
}

// aciklamalar.txt içinden belirli numaralı gönderinin açıklamasını alır.
async function packCaption(num: string) {
  const text = await readFile(join(PACK, "aciklamalar.txt"), "utf8");
  const block = text.split("━━━ ").find((b) => b.startsWith(`${num} `));
  if (!block) throw new Error(`Paket açıklaması bulunamadı: ${num}`);
  return block.split("AÇIKLAMA (kopyala-yapıştır):\n")[1].trim();
}

async function main() {
  // ── Hafta öncesi: 3-4 Ekim ──
  const d0 = join(OUT, "0-Hafta-Oncesi-3-4-Ekim");
  await copyFrom(d0, "1-CUMARTESI-3Ekim-FEED-01-rusca-soru.png", "1-Feed-Soru-Kare/01-rusca-soru.png");
  await copyFrom(d0, "2-PAZAR-4Ekim-FEED-02-ingilizce-soru.png", "1-Feed-Soru-Kare/02-ingilizce-soru.png");
  await copyFrom(d0, "3-PAZAR-4Ekim-HIKAYE-01-rusca-cevap.png", "2-Ertesi-Gun-Hikaye-Cevap/01-rusca-cevap.png");
  await put(d0, "NOT.txt", [
    "HAFTA ÖNCESİ (profil boş görünmesin diye)",
    "",
    "CUMARTESİ 3 EKİM, 19:00-21:00 arası",
    "• FEED: 1-CUMARTESI-3Ekim-FEED-01-rusca-soru.png",
    "• Açıklama:",
    await packCaption("01"),
    "",
    "PAZAR 4 EKİM, 19:00-21:00 arası",
    "• FEED: 2-PAZAR-4Ekim-FEED-02-ingilizce-soru.png",
    "• Açıklama:",
    await packCaption("02"),
    "• HİKÂYE: 3-PAZAR-4Ekim-HIKAYE-01-rusca-cevap.png (dünkü Rusça sorunun cevabı)",
  ].join("\n"));

  // ── Pazartesi 5 Ekim ──
  const d1 = join(OUT, "1-Pazartesi-5-Ekim");
  await copyFrom(d1, "1-FEED-03-rusca-soru.png", "1-Feed-Soru-Kare/03-rusca-soru.png");
  await copyFrom(d1, "2-HIKAYE-02-ingilizce-cevap.png", "2-Ertesi-Gun-Hikaye-Cevap/02-ingilizce-cevap.png");
  await put(
    d1,
    "3-HIKAYE-bu-hafta-kac-gun-seri.png",
    await png(({ size, logo }) => (
      <InfoCard size={size} logo={logo} emoji="🔥" title="Bu hafta kaç gün seri yapacaksın?" lines={["Kaydırıcıyı oynat 👇"]} footer="Her gün 1 soru çöz" />
    ), ST)
  );
  await put(d1, "NOT.txt", [
    "PAZARTESİ 5 EKİM — Günün Rusça Sorusu",
    "",
    "1) FEED (19:00-21:00 arası): 1-FEED-03-rusca-soru.png",
    "   Açıklama:",
    await packCaption("03"),
    "",
    "2) HİKÂYE: 2-HIKAYE-02-ingilizce-cevap.png (pazar günü sorduğun İngilizce sorunun cevabı)",
    "3) HİKÂYE: 3-HIKAYE-bu-hafta-kac-gun-seri.png — üstüne \"Emoji kaydırıcı\" çıkartması ekle (🔥 seç).",
    "",
    "Gün içinde gelen yorumlara cevap ver; doğru bilenlere \"Aferin 👏\" yaz.",
  ].join("\n"));

  // ── Salı 6 Ekim ──
  const d2 = join(OUT, "2-Sali-6-Ekim");
  await copyFrom(d2, "1-FEED-04-ingilizce-soru.png", "1-Feed-Soru-Kare/04-ingilizce-soru.png");
  await copyFrom(d2, "2-HIKAYE-03-rusca-cevap.png", "2-Ertesi-Gun-Hikaye-Cevap/03-rusca-cevap.png");
  await put(d2, "NOT.txt", [
    "SALI 6 EKİM — Günün İngilizce Sorusu",
    "",
    "1) FEED (19:00-21:00 arası): 1-FEED-04-ingilizce-soru.png",
    "   Açıklama:",
    await packCaption("04"),
    "",
    "2) HİKÂYE: 2-HIKAYE-03-rusca-cevap.png (dünkü Rusça sorunun cevabı)",
  ].join("\n"));

  // ── Çarşamba 7 Ekim: Mini Ders (5 slayt) ──
  const d3 = join(OUT, "3-Carsamba-7-Ekim");
  const slides: ((ctx: { size: Size; logo: string }) => ReactElement)[] = [
    ({ size, logo }) => (
      <InfoCard size={size} logo={logo} emoji="📖" title="Rusçada fiil çekimi 1 dakikada" lines={["читать = okumak", "Kaydır 👉"]} footer="Mini Ders" titleSize={76} />
    ),
    ({ size, logo }) => (
      <LessonSlide
        size={size}
        logo={logo}
        step={2}
        total={5}
        heading="читать (okumak)"
        rows={[
          { left: "я читаю", right: "ben okuyorum" },
          { left: "ты читаешь", right: "sen okuyorsun" },
          { left: "он / она читает", right: "o okuyor" },
          { left: "мы читаем", right: "biz okuyoruz" },
          { left: "вы читаете", right: "siz okuyorsunuz" },
          { left: "они читают", right: "onlar okuyor" },
        ]}
      />
    ),
    ({ size, logo }) => (
      <LessonSlide
        size={size}
        logo={logo}
        step={3}
        total={5}
        heading="Örnek cümleler"
        rows={[
          { left: "Я читаю книгу.", right: "Ben kitap okuyorum." },
          { left: "Ты читаешь газету.", right: "Sen gazete okuyorsun." },
        ]}
        note="книга (kitap) cümlede nesne olunca книгу olur."
      />
    ),
    ({ size, logo }) => (
      <InfoCard size={size} logo={logo} emoji="🤔" title="Sıra sende!" lines={["Biz kitap okuyoruz — Rusçası?", "Cevabını yorumlara yaz 👇"]} footer="Cevap Perşembe günü hikâyede" />
    ),
    ({ size, logo }) => (
      <InfoCard size={size} logo={logo} emoji="🎁" title="Daha fazla Rusça test" lines={["Profildeki linke tıkla", "Kayıt olmadan 5 soruluk test çöz"]} footer="Ücretsiz dene" />
    ),
  ];
  for (let i = 0; i < slides.length; i++) {
    await put(d3, `1-FEED-mini-ders-slayt-${i + 1}.png`, await png(slides[i], SQ));
  }
  await copyFrom(d3, "2-HIKAYE-04-ingilizce-cevap.png", "2-Ertesi-Gun-Hikaye-Cevap/04-ingilizce-cevap.png");
  await put(d3, "NOT.txt", [
    "ÇARŞAMBA 7 EKİM — Mini Ders: Rusçada fiil çekimi",
    "",
    "1) FEED (kaydırmalı gönderi): Instagram'da + > Gönderi > \"Birden fazla seç\" ve 1-FEED-mini-ders-slayt-1...5 dosyalarını SIRAYLA seç.",
    "   Açıklama:",
    "Rusçada fiil çekimi 1 dakikada 📖",
    "Kaydet, sonra tekrar bak 📌",
    "",
    "Sıra sende: \"Biz kitap okuyoruz\" Rusçada nasıl denir? Cevabını yorumlara yaz 👇 (Cevabı Perşembe günü hikâyede!)",
    "",
    `🎁 Ücretsiz dene: ${LINK_RU}`,
    "",
    HASH_RU,
    "",
    "2) HİKÂYE: 2-HIKAYE-04-ingilizce-cevap.png (dünkü İngilizce sorunun cevabı)",
  ].join("\n"));

  // ── Perşembe 8 Ekim: Reels ──
  const d4 = join(OUT, "4-Persembe-8-Ekim");
  const days = [
    ["понедельник", "Pazartesi", "panidelnik"],
    ["вторник", "Salı", "ftornik"],
    ["среда", "Çarşamba", "sreda"],
    ["четверг", "Perşembe", "çetverg"],
    ["пятница", "Cuma", "pyatnitsa"],
    ["суббота", "Cumartesi", "subbota"],
    ["воскресенье", "Pazar", "voskresenye"],
  ];
  const work = await mkdtemp(join(tmpdir(), "ardemy-reels-"));
  const frames: { file: string; sec: number }[] = [];
  const addFrame = async (name: string, buf: Buffer, sec: number) => {
    const file = join(work, name);
    await writeFile(file, buf);
    frames.push({ file: file.replace(/\\/g, "/"), sec });
  };
  await addFrame(
    "00.png",
    await png(({ size, logo }) => (
      <InfoCard size={size} logo={logo} emoji="🇷🇺" title="Rusçada haftanın günleri" lines={["15 saniyede öğren!"]} footer="Ardemy Academy" titleSize={80} />
    ), ST),
    2
  );
  for (let i = 0; i < days.length; i++) {
    const [ru, tr, reading] = days[i];
    await addFrame(
      `${String(i + 1).padStart(2, "0")}.png`,
      await png(({ size, logo }) => (
        <WordFrame size={size} logo={logo} topic="Rusçada haftanın günleri" word={ru} meaning={tr} reading={reading} />
      ), ST),
      1.6
    );
  }
  await addFrame(
    "99.png",
    await png(({ size, logo }) => (
      <InfoCard size={size} logo={logo} emoji="💬" title="Hangisi en zoru?" lines={["Yorumlara yaz 👇", "Ücretsiz test: profildeki link"]} footer="Takip et, her gün yeni soru" />
    ), ST),
    1.8
  );
  const list = [
    ...frames.map((f) => `file '${f.file}'\nduration ${f.sec}`),
    `file '${frames[frames.length - 1].file}'`,
  ].join("\n");
  await writeFile(join(work, "list.txt"), list);
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
      join(d4, "1-REELS-rusca-haftanin-gunleri.mp4"),
    ],
    { stdio: "inherit" }
  );
  await put(
    d4,
    "2-HIKAYE-mini-ders-cevabi.png",
    await png(({ size, logo }) => (
      <InfoCard size={size} logo={logo} emoji="✅" title="Мы читаем книгу" lines={["Biz kitap okuyoruz", "Doğru bildin mi? 👏"]} footer="Dünkü mini ders sorusunun cevabı" titleSize={80} />
    ), ST)
  );
  await put(
    d4,
    "3-HIKAYE-anket-rusca-mi-ingilizce-mi.png",
    await png(({ size, logo }) => (
      <InfoCard size={size} logo={logo} emoji="🗳️" title="Rusça mı, İngilizce mi?" lines={["Hangisini öğrenmek istiyorsun?"]} footer="Anketi oyla" />
    ), ST)
  );
  await put(d4, "NOT.txt", [
    "PERŞEMBE 8 EKİM — Reels: Rusçada haftanın günleri (15 saniye)",
    "",
    "1) REELS: Instagram'da + > Reels > galeriden 1-REELS-rusca-haftanin-gunleri.mp4 seç > İstersen hafif, sözsüz bir müzik ekle > Paylaş.",
    "   Açıklama:",
    "Rusçada haftanın günlerini 15 saniyede öğren! 🇷🇺",
    "Hangisi en zoru? Yorumlara yaz 👇",
    "Kaydet, sonra tekrar bak 📌",
    "",
    `🎁 Ücretsiz dene: ${LINK_RU}`,
    "",
    HASH_RU,
    "",
    "2) HİKÂYE: 2-HIKAYE-mini-ders-cevabi.png (çarşamba mini ders sorusunun cevabı)",
    "3) HİKÂYE: 3-HIKAYE-anket-rusca-mi-ingilizce-mi.png — üstüne \"Anket\" çıkartması ekle (Rusça / İngilizce).",
    "   Sonuçlara göre hangi dile daha çok içerik yapacağını anlarsın.",
  ].join("\n"));

  // ── Cuma 9 Ekim: Tanıtım ──
  const d5 = join(OUT, "5-Cuma-9-Ekim");
  await put(
    d5,
    "1-FEED-seri-tanitim.png",
    await png(({ size, logo }) => (
      <InfoCard
        size={size}
        logo={logo}
        emoji="🔥"
        title="Her gün 1 soru, serini büyüt!"
        lines={["30 günlük seri = 40 dk ücretsiz ders", "Bir gün kaçırırsan seri koruma 🛡️ kurtarır", "Kayıt ol, 2 kredi hediye"]}
        footer="Profildeki linkten ücretsiz dene"
        titleSize={68}
      />
    ), SQ)
  );
  await put(
    d5,
    "2-HIKAYE-ucretsiz-test-dene.png",
    await png(({ size, logo }) => (
      <InfoCard size={size} logo={logo} emoji="📝" title="5 soruda seviyeni dene" lines={["Kayıt gerekmez", "Linke dokun 👇"]} footer="Ücretsiz test" />
    ), ST)
  );
  await put(d5, "NOT.txt", [
    "CUMA 9 EKİM — Platform tanıtımı: Günlük seri",
    "",
    "1) FEED (19:00-21:00 arası): 1-FEED-seri-tanitim.png",
    "   Açıklama:",
    "Her gün 1 soru çöz, serini büyüt! 🔥",
    "30 günlük seride 40 dakika ücretsiz ders hediye. Bir gün kaçırırsan seri koruma devreye girer 🛡️",
    "",
    `🎁 Ücretsiz dene: ${LINK_ANY}`,
    "",
    "#dilöğrenme #rusça #ingilizce #ardemyacademy",
    "",
    "2) HİKÂYE: 2-HIKAYE-ucretsiz-test-dene.png — üstüne \"Bağlantı\" çıkartması ekle ve şu adresi yaz:",
    `   ${LINK_ANY}`,
    "   Öğrenci seni etiketlediyse onun hikâyesini de paylaş.",
  ].join("\n"));

  // ── Cumartesi 10 Ekim: Haftanın Zor Sorusu (Rusça) ──
  const hard = await prisma.quizItem.findUniqueOrThrow({
    where: { id: "cms1wu184000plsw7sw5pxt0w" },
    select: { prompt: true, optionA: true, optionB: true, optionC: true, optionD: true, correct: true },
  });
  const hardOptions = [hard.optionA, hard.optionB, hard.optionC, hard.optionD];
  const hardCorrect = ["A", "B", "C", "D"].indexOf(hard.correct);
  const hardCard = (reveal: boolean) => function HardCard({ size, logo }: { size: Size; logo: string }) {
    return (
    <QuestionCard size={size} logo={logo} language="Rusça" label="Haftanın Zor Sorusu" prompt={hard.prompt} options={hardOptions} correct={hardCorrect} reveal={reveal} />
    );
  };
  const d6 = join(OUT, "6-Cumartesi-10-Ekim");
  await put(d6, "1-FEED-haftanin-zor-sorusu.png", await png(hardCard(false), SQ));
  await put(
    d6,
    "2-HIKAYE-cevap-yarin.png",
    await png(({ size, logo }) => (
      <InfoCard size={size} logo={logo} emoji="⏳" title="Haftanın zor sorusunu çözdün mü?" lines={["Cevap yarın hikâyede!", "Cevabını gönderiye yaz 👇"]} footer="Cumartesi gönderisine bak" titleSize={72} />
    ), ST)
  );
  await put(d6, "NOT.txt", [
    "CUMARTESİ 10 EKİM — Haftanın Zor Sorusu (Rusça)",
    "",
    "1) FEED (19:00-21:00 arası): 1-FEED-haftanin-zor-sorusu.png",
    "   Açıklama:",
    [
      "🧠 Haftanın zor sorusu!",
      "",
      hard.prompt,
      ...hardOptions.map((o, i) => `${"ABCD"[i]}) ${o}`),
      "",
      "Cevabını yorumlara yaz 👇 Doğru cevap yarın hikayemizde!",
      "",
      `🎁 Ücretsiz dene: ${LINK_RU}`,
      "",
      HASH_RU,
    ].join("\n"),
    "",
    "2) HİKÂYE: 2-HIKAYE-cevap-yarin.png — üstüne \"Soru sor\" ya da \"Test\" çıkartması eklemek isteyebilirsin.",
  ].join("\n"));

  // ── Pazar 11 Ekim ──
  const d7 = join(OUT, "7-Pazar-11-Ekim");
  await put(d7, "1-HIKAYE-zor-sorunun-cevabi.png", await png(hardCard(true), ST));
  await put(d7, "NOT.txt", [
    "PAZAR 11 EKİM — Dinlenme günü (feed yok)",
    "",
    "1) HİKÂYE: 1-HIKAYE-zor-sorunun-cevabi.png (dünkü zor sorunun cevabı)",
    "2) HİKÂYE (kendin yaz): haftanın özeti. Örnek:",
    "   \"Bu hafta 6 gönderi paylaştık, hepinize teşekkürler! 🙏",
    "    Haftaya: İngilizce Present Perfect mini dersi ve yeni sorular. Takipte kal!\"",
    "",
    "HAFTALIK HAZIRLIK (15 dk):",
    "• Yönetici paneli > 📣 Sosyal Medya sayfasından gelecek haftanın Pazartesi/Salı/Cumartesi sorularını indir.",
    "• 30 günlük takvimdeki \"2. hafta\" satırlarına bak: Çarşamba mini ders (Present Perfect), Perşembe Reels (make/do).",
    "• Bu hafta en çok beğenilen gönderiyi Insights'tan kontrol et.",
  ].join("\n"));

  // ── Genel okuma notu ──
  await put(OUT, "OKU-BENI.txt", [
    "ARDEMY INSTAGRAM — 1. HAFTA PAKETİ",
    "",
    "Her gün için bir klasör var. Klasörün içinde dosyalar paylaşım sırasıyla numaralı, NOT.txt'de açıklama metinleri ve hikâyelere eklenecek çıkartmalar yazıyor.",
    "",
    "Cumartesi 3 Ekim : 0-Hafta-Oncesi (01 numaralı Rusça soru)",
    "Pazar 4 Ekim     : 0-Hafta-Oncesi (02 numaralı İngilizce soru + dünkü cevap hikâyesi)",
    "Pazartesi 5 Ekim : Rusça soru + hikâyeler",
    "Salı 6 Ekim      : İngilizce soru + hikâye",
    "Çarşamba 7 Ekim  : Mini Ders (5 slayt) + hikâye",
    "Perşembe 8 Ekim  : Reels videosu + 2 hikâye",
    "Cuma 9 Ekim      : Seri tanıtımı + hikâye",
    "Cumartesi 10 Ekim: Haftanın zor sorusu + hikâye",
    "Pazar 11 Ekim    : Dinlenme + cevap hikâyesi",
    "",
    "Saat: akşam 19:00-21:00 arası paylaşmak genelde iyi sonuç verir.",
    "Hikâyelerde link/anket/kaydırıcı çıkartmalarını NOT.txt'de yazdığı gibi sen eklersin.",
  ].join("\n"));

  console.log("1. hafta paketi hazır:", OUT);
  await prisma.$disconnect();
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
