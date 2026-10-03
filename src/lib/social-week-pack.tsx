// Admin paneli için haftalık Instagram SORU paketi (zip): Pazartesi Rusça soru,
// Salı İngilizce soru, Cumartesi haftanın zor sorusu; ertesi günlerin cevap
// hikâyeleri, genel hikâye görselleri ve her gün için açıklama metinleri.
// Mini ders, Reels ve tanıtım gönderileri özel içerik gerektirdiği için pakete
// dahil değildir (README'de belirtilir). Her şey Türkçedir (yönetici içeriği).

import JSZip from "jszip";
import { ImageResponse } from "next/og";
import type { ReactElement } from "react";
import { getOgAssets, OG_FORMATS } from "@/lib/og/assets";
import { QuestionCard } from "@/lib/og/cards";
import { InfoCard } from "@/lib/og/cards-extra";
import {
  buildSocialCaption,
  pickSocialQuestions,
  type SocialQuestion,
} from "@/lib/social-question";
import { INSTAGRAM_HANDLE, SITE_URL } from "@/lib/site";

const DAYS = ["Pazartesi", "Salı", "Çarşamba", "Perşembe", "Cuma", "Cumartesi", "Pazar"];
const MONTHS = [
  "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
  "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık",
];
const FOLLOW = `📲 Takip et: ${INSTAGRAM_HANDLE}`;

type Size = { width: number; height: number };
type Build = (ctx: { size: Size; logo: string }) => ReactElement;

export function isValidStart(value: string | null): value is string {
  return !!value && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
}

// Verilen tarihten sonraki (bugün dahil değil) ilk Pazartesi, YYYY-MM-DD.
export function nextMonday(from = new Date()): string {
  const d = new Date(Date.UTC(from.getUTCFullYear(), from.getUTCMonth(), from.getUTCDate()));
  const add = ((8 - d.getUTCDay()) % 7) || 7;
  d.setUTCDate(d.getUTCDate() + add);
  return d.toISOString().slice(0, 10);
}

export async function buildWeekPack(start: string): Promise<Buffer> {
  const first = new Date(`${start}T00:00:00Z`);
  const dayLabel = (i: number) => {
    const d = new Date(first.getTime() + i * 86_400_000);
    return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;
  };
  const ascii = (text: string) =>
    text
      .replace(/ç/g, "c").replace(/Ç/g, "C").replace(/ğ/g, "g").replace(/Ğ/g, "G")
      .replace(/ı/g, "i").replace(/İ/g, "I").replace(/ö/g, "o").replace(/Ö/g, "O")
      .replace(/ş/g, "s").replace(/Ş/g, "S").replace(/ü/g, "u").replace(/Ü/g, "U");
  const folder = (i: number) => `${i + 1}-${ascii(DAYS[i])}-${ascii(dayLabel(i)).replace(" ", "-")}`;

  // Haftanın zor sorusunun dili haftaya göre değişir (Rusça / İngilizce sırayla).
  const weekNumber = Math.floor(first.getTime() / (7 * 86_400_000));
  const hardLanguage = weekNumber % 2 === 0 ? "Rusça" : "İngilizce";

  const [ru, en, hard] = await Promise.all([
    pickSocialQuestions("Rusça", start, 1),
    pickSocialQuestions("İngilizce", start, 1),
    pickSocialQuestions(
      hardLanguage,
      `${start}:hard`,
      1,
      hardLanguage === "Rusça" ? "Padejler" : "Zamanlar"
    ),
  ]);
  if (!ru[0] || !en[0] || !hard[0]) {
    throw new Error("Pakete uygun yeterli soru bulunamadı.");
  }
  const qMon = ru[0];
  const qTue = en[0];
  const qSat = hard[0];

  const { fonts, logo } = await getOgAssets();
  const png = async (build: Build, size: Size) => {
    const res = new ImageResponse(build({ size, logo }), { ...size, fonts });
    return Buffer.from(await res.arrayBuffer());
  };
  const SQ = OG_FORMATS.square;
  const ST = OG_FORMATS.story;

  const qBuild = (q: SocialQuestion, language: string, reveal: boolean, label?: string): Build =>
    function Q({ size, logo: l }) {
      return (
        <QuestionCard size={size} logo={l} language={language} label={label} prompt={q.prompt} options={q.options} correct={q.correct} reveal={reveal} />
      );
    };
  const info = (props: { emoji: string; title: string; lines?: string[]; footer: string; titleSize?: number }): Build =>
    function I({ size, logo: l }) {
      return <InfoCard size={size} logo={l} {...props} />;
    };
  const answerLine = (q: SocialQuestion) => `Doğru cevap: ${"ABCD"[q.correct]}) ${q.options[q.correct]}`;
  const hardCaption = (q: SocialQuestion, language: string) => {
    const slug = language === "Rusça" ? "rusca" : "ingilizce";
    return [
      "🧠 Haftanın zor sorusu!",
      "",
      q.prompt,
      ...q.options.map((o, i) => `${"ABCD"[i]}) ${o}`),
      "",
      "Cevabını yorumlara yaz 👇 Doğru cevap yarın hikayemizde!",
      "",
      `🎁 Ücretsiz dene: ${SITE_URL}/dene/${slug}`,
      FOLLOW,
    ].join("\n");
  };

  const zip = new JSZip();
  const add = (path: string, data: Buffer | string) => zip.file(path, data);
  const hours = "Paylaşım saati: akşam 19:00-21:00 arası.";

  // Pazartesi
  add(`${folder(0)}/1-FEED-rusca-soru.png`, await png(qBuild(qMon, "Rusça", false), SQ));
  add(`${folder(0)}/2-HIKAYE-bu-hafta-hedefin-ne.png`, await png(info({ emoji: "🎯", title: "Bu hafta hedefin ne?", lines: ["Kaç gün seri yapacaksın?", "Kaydırıcıyı oynat 👇"], footer: "Her gün 1 soru çöz" }), ST));
  add(`${folder(0)}/NOT.txt`, [
    `PAZARTESİ ${dayLabel(0)} — Günün Rusça Sorusu`, hours, "",
    "FEED: 1-FEED-rusca-soru.png", answerLine(qMon), "Açıklama:", buildSocialCaption("Rusça", qMon), "",
    "HİKÂYE: 2-HIKAYE-bu-hafta-hedefin-ne.png — üstüne \"Emoji kaydırıcı\" çıkartması ekle.",
  ].join("\n"));

  // Salı
  add(`${folder(1)}/1-FEED-ingilizce-soru.png`, await png(qBuild(qTue, "İngilizce", false), SQ));
  add(`${folder(1)}/2-HIKAYE-dunku-rusca-cevap.png`, await png(qBuild(qMon, "Rusça", true), ST));
  add(`${folder(1)}/NOT.txt`, [
    `SALI ${dayLabel(1)} — Günün İngilizce Sorusu`, hours, "",
    "FEED: 1-FEED-ingilizce-soru.png", answerLine(qTue), "Açıklama:", buildSocialCaption("İngilizce", qTue), "",
    "HİKÂYE: 2-HIKAYE-dunku-rusca-cevap.png (dünkü Rusça sorunun cevabı)",
  ].join("\n"));

  // Çarşamba
  add(`${folder(2)}/1-HIKAYE-dunku-ingilizce-cevap.png`, await png(qBuild(qTue, "İngilizce", true), ST));
  add(`${folder(2)}/NOT.txt`, [
    `ÇARŞAMBA ${dayLabel(2)} — Mini Ders günü`, "",
    "HİKÂYE: 1-HIKAYE-dunku-ingilizce-cevap.png (dünkü İngilizce sorunun cevabı)",
    "FEED (Mini Ders, 5 slayt): Bu paket mini ders içermiyor. Konu seçip bana yazarsan slaytları hazırlarım.",
  ].join("\n"));

  // Perşembe
  add(`${folder(3)}/1-HIKAYE-anket-rusca-mi-ingilizce-mi.png`, await png(info({ emoji: "🗳️", title: "Rusça mı, İngilizce mi?", lines: ["Hangisini öğrenmek istiyorsun?"], footer: "Anketi oyla" }), ST));
  add(`${folder(3)}/NOT.txt`, [
    `PERŞEMBE ${dayLabel(3)} — Reels günü`, "",
    "HİKÂYE: 1-HIKAYE-anket-rusca-mi-ingilizce-mi.png — üstüne \"Anket\" çıkartması ekle (Rusça / İngilizce).",
    "REELS (15 sn): Bu paket video içermiyor. Konu seçip bana yazarsan hazırlarım.",
  ].join("\n"));

  // Cuma
  add(`${folder(4)}/1-HIKAYE-ucretsiz-test-dene.png`, await png(info({ emoji: "📝", title: "5 soruda seviyeni dene", lines: ["Kayıt gerekmez", "Linke dokun 👇"], footer: "Ücretsiz test" }), ST));
  add(`${folder(4)}/NOT.txt`, [
    `CUMA ${dayLabel(4)} — Platform tanıtımı günü`, "",
    `HİKÂYE: 1-HIKAYE-ucretsiz-test-dene.png — üstüne "Bağlantı" çıkartması ekle: ${SITE_URL}/dene`,
    "FEED (tanıtım): Bu paket tanıtım görseli içermiyor (seri, deneme sınavı, rozet, arkadaşını getir). İstersen bana yaz.",
  ].join("\n"));

  // Cumartesi
  add(`${folder(5)}/1-FEED-haftanin-zor-sorusu.png`, await png(qBuild(qSat, hardLanguage, false, "Haftanın Zor Sorusu"), SQ));
  add(`${folder(5)}/2-HIKAYE-cevap-yarin.png`, await png(info({ emoji: "⏳", title: "Haftanın zor sorusunu çözdün mü?", lines: ["Cevap yarın hikâyede!", "Cevabını gönderiye yaz 👇"], footer: "Cumartesi gönderisine bak", titleSize: 72 }), ST));
  add(`${folder(5)}/NOT.txt`, [
    `CUMARTESİ ${dayLabel(5)} — Haftanın Zor Sorusu (${hardLanguage})`, hours, "",
    "FEED: 1-FEED-haftanin-zor-sorusu.png", answerLine(qSat), "Açıklama:", hardCaption(qSat, hardLanguage), "",
    "HİKÂYE: 2-HIKAYE-cevap-yarin.png",
  ].join("\n"));

  // Pazar
  add(`${folder(6)}/1-HIKAYE-zor-sorunun-cevabi.png`, await png(qBuild(qSat, hardLanguage, true, "Haftanın Zor Sorusu"), ST));
  add(`${folder(6)}/NOT.txt`, [
    `PAZAR ${dayLabel(6)} — Dinlenme günü (feed yok)`, "",
    "HİKÂYE: 1-HIKAYE-zor-sorunun-cevabi.png (dünkü zor sorunun cevabı)",
    "HİKÂYE (kendin yaz): haftanın özeti ve gelecek haftanın duyurusu.",
  ].join("\n"));

  add("OKU-BENI.txt", [
    `HAFTALIK SORU PAKETİ — ${dayLabel(0)} haftası`, "",
    "İçerik: Pazartesi Rusça soru, Salı İngilizce soru, Cumartesi haftanın zor sorusu; ertesi günlerin cevap hikâyeleri ve genel hikâye görselleri.",
    "Dahil olmayanlar: Çarşamba mini ders, Perşembe Reels, Cuma tanıtım gönderisi (özel içerik gerektirir).",
    "Aynı başlangıç tarihiyle tekrar indirirsen aynı sorular gelir; farklı hafta için başka tarih seç.",
    "Her gün klasöründeki NOT.txt'de açıklama metni ve hikâyelere eklenecek çıkartmalar yazıyor.",
  ].join("\n"));

  return zip.generateAsync({ type: "nodebuffer", compression: "DEFLATE" });
}
