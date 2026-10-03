// Haftalık Instagram paketi script'leri için ortak yardımcılar (3. haftadan itibaren).
// 1. ve 2. hafta script'leri kendi içinde aynı işleri yapar; değiştirilmeden bırakıldı.

import { execFileSync } from "node:child_process";
import { mkdir, mkdtemp, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import type { ReactElement } from "react";
import { ImageResponse } from "next/og";
import { prisma } from "../../src/lib/prisma";
import { getOgAssets, OG_FORMATS } from "../../src/lib/og/assets";
import { QuestionCard } from "../../src/lib/og/cards";
import { InfoCard, WordFrame } from "../../src/lib/og/cards-extra";

export const SQ = OG_FORMATS.square;
export const ST = OG_FORMATS.story;

export type Size = { width: number; height: number };
export type Build = (ctx: { size: Size; logo: string }) => ReactElement;

export async function png(build: Build, size: Size) {
  const { fonts, logo } = await getOgAssets();
  const res = new ImageResponse(build({ size, logo }), { ...size, fonts });
  return Buffer.from(await res.arrayBuffer());
}

export async function put(dir: string, name: string, data: Buffer | string) {
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, name), data);
}

export async function loadQuestion(id: string) {
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

export type LoadedQuestion = Awaited<ReturnType<typeof loadQuestion>>;

export function answerLine(q: LoadedQuestion) {
  return `Doğru cevap: ${"ABCD"[q.correct]}) ${q.options[q.correct]}`;
}

export function questionBuild(
  q: LoadedQuestion,
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

export function info(props: {
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

export function wordFrame(props: {
  topic: string;
  word: string;
  meaning: string;
  reading?: string;
  note?: string;
}): Build {
  return function Word({ size, logo }) {
    return <WordFrame size={size} logo={logo} {...props} />;
  };
}

// Başlık karesi + kelime kareleri + kapanış karesinden 9:16 Reels videosu üretir.
export async function makeReels(opts: {
  ffmpeg: string;
  outFile: string;
  title: Build;
  titleSec: number;
  words: { build: Build; sec: number }[];
  outro: Build;
  outroSec: number;
}) {
  const work = await mkdtemp(join(tmpdir(), "ardemy-reels-"));
  const frames: { file: string; sec: number }[] = [];
  const add = async (name: string, build: Build, sec: number) => {
    const file = join(work, name);
    await writeFile(file, await png(build, ST));
    frames.push({ file: file.replace(/\\/g, "/"), sec });
  };
  await add("00.png", opts.title, opts.titleSec);
  for (let i = 0; i < opts.words.length; i++) {
    await add(`${String(i + 1).padStart(2, "0")}.png`, opts.words[i].build, opts.words[i].sec);
  }
  await add("99.png", opts.outro, opts.outroSec);
  await writeFile(
    join(work, "list.txt"),
    [
      ...frames.map((f) => `file '${f.file}'\nduration ${f.sec}`),
      `file '${frames[frames.length - 1].file}'`,
    ].join("\n")
  );
  execFileSync(
    opts.ffmpeg,
    [
      "-y", "-loglevel", "error",
      "-f", "concat", "-safe", "0", "-i", join(work, "list.txt"),
      "-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo",
      "-vf", "fps=30,format=yuv420p",
      "-c:v", "libx264", "-preset", "medium", "-crf", "20",
      "-c:a", "aac", "-shortest", "-movflags", "+faststart",
      opts.outFile,
    ],
    { stdio: "inherit" }
  );
}
