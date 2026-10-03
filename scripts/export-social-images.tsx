// Kullanım: DATABASE_URL=... npx tsx scripts/export-social-images.tsx "<çıktı-klasörü>" [dil-başına-adet] [ofset-değişiklikleri-json]
//
// Instagram için hazır gönderi paketi üretir: kare soru görselleri (feed),
// hikâye boyutunda cevap görselleri ve her gönderi için açıklama metni.
// Diller sırayla karışık gider (Rusça, İngilizce, Rusça, ...).

import "dotenv/config";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { getOgAssets, OG_FORMATS } from "../src/lib/og/assets";
import { QuestionCard } from "../src/lib/og/cards";
import {
  buildSocialCaption,
  getSocialQuestion,
  SOCIAL_LANGUAGES,
} from "../src/lib/social-question";

const outDir = process.argv[2];
const perLanguage = Number(process.argv[3] ?? "3");
// İsteğe bağlı: belirli bir sıradaki soruyu elle değiştirmek için, ör.
// '{"İngilizce:1": 610}' (dil:sıra → soru ofseti).
const overrides: Record<string, number> = JSON.parse(process.argv[4] ?? "{}");

if (!outDir) {
  console.error("Çıktı klasörü gerekli.");
  process.exit(1);
}

async function render(
  language: string,
  n: number,
  format: "square" | "story",
  reveal: boolean
) {
  const { fonts, logo } = await getOgAssets();
  const { question } = await getSocialQuestion(language, n);
  if (!question) throw new Error(`${language} için soru bulunamadı.`);
  const size = OG_FORMATS[format];
  const res = new ImageResponse(
    (
      <QuestionCard
        size={size}
        logo={logo}
        language={language}
        prompt={question.prompt}
        options={question.options}
        correct={question.correct}
        reveal={reveal}
      />
    ),
    { ...size, fonts }
  );
  return { question, png: Buffer.from(await res.arrayBuffer()) };
}

async function main() {
  const feedDir = join(outDir, "1-Feed-Soru-Kare");
  const storyDir = join(outDir, "2-Ertesi-Gun-Hikaye-Cevap");
  await mkdir(feedDir, { recursive: true });
  await mkdir(storyDir, { recursive: true });

  const captions: string[] = [];
  let order = 1;

  for (let i = 0; i < perLanguage; i++) {
    for (const language of SOCIAL_LANGUAGES) {
      const { total } = await getSocialQuestion(language, 0);
      // Aynı testten art arda sorular gelmesin diye adımlar geniş tutulur.
      const n =
        overrides[`${language}:${i}`] ??
        i * Math.max(1, Math.floor(total / perLanguage)) + i * 7;
      const slug = language === "Rusça" ? "rusca" : "ingilizce";
      const num = String(order).padStart(2, "0");

      const q = await render(language, n, "square", false);
      await writeFile(join(feedDir, `${num}-${slug}-soru.png`), q.png);
      const a = await render(language, n, "story", true);
      await writeFile(join(storyDir, `${num}-${slug}-cevap.png`), a.png);

      captions.push(
        `━━━ ${num} · ${language} ━━━\nFeed görseli: 1-Feed-Soru-Kare/${num}-${slug}-soru.png\nErtesi gün hikâye: 2-Ertesi-Gun-Hikaye-Cevap/${num}-${slug}-cevap.png\nDoğru cevap: ${"ABCD"[q.question.correct]}) ${q.question.options[q.question.correct]}\n\nAÇIKLAMA (kopyala-yapıştır):\n${buildSocialCaption(language, q.question)}\n`
      );
      order++;
    }
  }

  await writeFile(join(outDir, "aciklamalar.txt"), captions.join("\n\n"), "utf8");
  console.log(`${order - 1} gönderi hazırlandı: ${outDir}`);
  process.exit(0);
}

main();
