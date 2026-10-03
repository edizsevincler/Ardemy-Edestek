// Deneme sınavı soru satırı: [konu, soru, DOĞRU, yanlış1, yanlış2, yanlış3, açıklama?]
// Doğru şık her zaman ilk yazılır; seed sırasında şıklar soruya özgü sabit bir
// karıştırmayla dağıtılır (tekrar çalıştırınca aynı sonuç — idempotent).
export type ExamRow = [
  topic: string,
  prompt: string,
  correct: string,
  w1: string,
  w2: string,
  w3: string,
  explanation?: string,
];

function hash(value: string) {
  let h = 2166136261;
  for (const ch of value) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) >>> 0;
    let t = seed;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function buildExamQuestions(language: string, rows: ExamRow[]) {
  const letters = ["A", "B", "C", "D"] as const;
  return rows.map(([topic, prompt, correct, w1, w2, w3, explanation], index) => {
    // Doğru şıkkın yeri sıra numarasına göre döner (A,B,C,D,A,...) — dağılım
    // dengeli kalır; yanlış şıklar soruya özgü sabit karıştırmayla dizilir.
    const rand = mulberry32(hash(prompt));
    const wrong = [w1, w2, w3];
    for (let i = wrong.length - 1; i > 0; i--) {
      const j = Math.floor(rand() * (i + 1));
      [wrong[i], wrong[j]] = [wrong[j], wrong[i]];
    }
    const slot = index % 4;
    const texts = [...wrong];
    texts.splice(slot, 0, correct);
    return {
      language,
      topic,
      prompt,
      optionA: texts[0],
      optionB: texts[1],
      optionC: texts[2],
      optionD: texts[3],
      correct: letters[slot],
      explanation: explanation || null,
    };
  });
}
