import {
  Document,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Packer,
} from "docx";
import * as fs from "fs";

export type Block =
  | { type: "rule"; text: string }
  | { type: "pattern"; text: string }
  | { type: "example"; en: string; tr: string }
  | { type: "spacer" };

export type LessonDef = {
  fileBase: string; // dosya adı (uzantısız)
  title: string;
  blocks: Block[];
};

function ruleParagraph(text: string): Paragraph {
  return new Paragraph({
    spacing: { after: 160 },
    children: [new TextRun({ text: `- ${text}`, size: 24 })],
  });
}

function patternParagraph(text: string): Paragraph {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: 120, after: 120 },
    children: [new TextRun({ text, bold: true, size: 26 })],
  });
}

function exampleParagraphs(en: string, tr: string): Paragraph[] {
  return [
    new Paragraph({
      spacing: { before: 100, after: 20 },
      children: [new TextRun({ text: en, size: 24 })],
    }),
    new Paragraph({
      spacing: { after: 140 },
      indent: { left: 360 },
      children: [new TextRun({ text: tr, italics: true, size: 22, color: "555555" })],
    }),
  ];
}

export function buildLessonDocument(title: string, blocks: Block[]): Document {
  const children: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 300 },
      heading: HeadingLevel.HEADING_1,
      children: [new TextRun({ text: title, bold: true })],
    }),
  ];

  for (const block of blocks) {
    if (block.type === "rule") {
      children.push(ruleParagraph(block.text));
    } else if (block.type === "pattern") {
      children.push(patternParagraph(block.text));
    } else if (block.type === "example") {
      children.push(...exampleParagraphs(block.en, block.tr));
    } else if (block.type === "spacer") {
      children.push(new Paragraph({ spacing: { after: 200 }, children: [] }));
    }
  }

  return new Document({
    sections: [
      {
        properties: {
          page: { size: { width: 11906, height: 16838 } }, // A4 (DXA)
        },
        children,
      },
    ],
  });
}

export async function writeLessonDocx(outDir: string, lesson: LessonDef) {
  const doc = buildLessonDocument(lesson.title, lesson.blocks);
  const buffer = await Packer.toBuffer(doc);
  const outPath = `${outDir}/${lesson.fileBase}.docx`;
  fs.writeFileSync(outPath, buffer);
  return outPath;
}
