import { prisma } from "@/lib/prisma";
import { dateKey } from "@/lib/streak";
import { INSTAGRAM_HANDLE, SITE_URL } from "@/lib/site";

export const SOCIAL_LANGUAGES = ["Rusça", "İngilizce"] as const;

export type SocialQuestion = {
  id: string;
  prompt: string;
  options: string[];
  correct: number; // 0..3
  subject: string;
};

function hashString(value: string) {
  let hash = 0;
  for (const char of value) {
    hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  }
  return hash;
}

// Kartın içine rahat sığan (kısa soru/şık) yayında test sorularından, bugünün
// tarihine ve `n` (başka soru) sırasına göre deterministik seçim yapar.
export async function getSocialQuestion(
  language: string,
  n: number
): Promise<{ question: SocialQuestion | null; total: number }> {
  const items = await prisma.quizItem.findMany({
    where: {
      question: {
        isPublished: true,
        type: "QUIZ",
        subject: { startsWith: language },
      },
    },
    orderBy: { id: "asc" },
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

  const fits = items.filter(
    (i) =>
      i.prompt.length <= 90 &&
      [i.optionA, i.optionB, i.optionC, i.optionD].every((o) => o.length <= 38)
  );
  if (fits.length === 0) return { question: null, total: 0 };

  const base = hashString(`${dateKey(new Date())}:${language}`);
  const index = (base + Math.max(0, n)) % fits.length;
  const item = fits[index];
  return {
    total: fits.length,
    question: {
      id: item.id,
      prompt: item.prompt,
      options: [item.optionA, item.optionB, item.optionC, item.optionD],
      correct: ["A", "B", "C", "D"].indexOf(item.correct),
      subject: item.question.subject,
    },
  };
}

const SLUGS: Record<string, string> = { Rusça: "rusca", İngilizce: "ingilizce" };
const HASHTAGS: Record<string, string> = {
  Rusça: "#rusça #rusçaöğreniyorum #dilöğrenme #ardemyacademy",
  İngilizce: "#ingilizce #ingilizceöğreniyorum #dilöğrenme #ardemyacademy",
};

// Instagram gönderisi için hazır açıklama metni.
export function buildSocialCaption(language: string, question: SocialQuestion) {
  return [
    `📅 Günün ${language} sorusu!`,
    "",
    question.prompt,
    ...question.options.map((o, i) => `${"ABCD"[i]}) ${o}`),
    "",
    "Cevabını yorumlara yaz 👇 Doğru cevap hikayemizde!",
    "",
    `🎁 Ücretsiz dene: ${SITE_URL}/dene/${SLUGS[language]}`,
    `📲 Takip et: ${INSTAGRAM_HANDLE}`,
    "",
    HASHTAGS[language],
  ].join("\n");
}
