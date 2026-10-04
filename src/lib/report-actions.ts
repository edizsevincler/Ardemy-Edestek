"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { sendAdminAlertEmail } from "@/lib/email";
import { getT } from "@/lib/i18n/server";
import { REPORT_REASONS } from "@/lib/report-reasons";

export type ReportResult = { ok: true } | { ok: false; message: string };

const DAILY_LIMIT = 15; // bir kullanıcı günde en fazla bu kadar bildirim gönderebilir

// Giriş yapmış kullanıcı bir soruyu (soru bankası veya deneme havuzu) bildirir.
// Aynı kullanıcı aynı soruyu tekrar bildirirse önceki bildirimi günceller.
export async function reportQuestion(input: {
  kind: "quiz" | "exam";
  itemId: string;
  reason: string;
  note?: string;
}): Promise<ReportResult> {
  const t = await getT();
  const session = await auth();
  if (!session?.user) return { ok: false, message: t("Bildirim için giriş yapmalısın.") };
  const userId = session.user.id;

  if (!(REPORT_REASONS as readonly string[]).includes(input.reason)) {
    return { ok: false, message: t("Bildirim gönderilemedi, biraz sonra tekrar dene.") };
  }
  const note = (input.note ?? "").trim().slice(0, 300) || null;

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recent = await prisma.questionReport.count({ where: { userId, createdAt: { gte: since } } });
  if (recent >= DAILY_LIMIT) {
    return { ok: false, message: t("Bugün çok fazla bildirim gönderdin, yarın tekrar dene.") };
  }

  // Soruyu o anki haliyle kaydet.
  let snapshot: Record<string, unknown> | null = null;
  if (input.kind === "quiz") {
    const item = await prisma.quizItem.findUnique({
      where: { id: input.itemId },
      include: { question: { select: { id: true, title: true, subject: true } } },
    });
    if (item) {
      snapshot = {
        prompt: item.prompt,
        options: [item.optionA, item.optionB, item.optionC, item.optionD],
        correct: item.correct,
        source: `${item.question.subject} — ${item.question.title}`,
        questionId: item.question.id,
      };
    }
  } else {
    const item = await prisma.examQuestion.findUnique({ where: { id: input.itemId } });
    if (item) {
      snapshot = {
        prompt: item.prompt,
        options: [item.optionA, item.optionB, item.optionC, item.optionD],
        correct: item.correct,
        source: `Deneme havuzu — ${item.language} / ${item.topic}`,
      };
    }
  }
  if (!snapshot) return { ok: false, message: t("Bildirim gönderilemedi, biraz sonra tekrar dene.") };

  await prisma.questionReport.upsert({
    where: { userId_kind_itemId: { userId, kind: input.kind, itemId: input.itemId } },
    create: { userId, kind: input.kind, itemId: input.itemId, reason: input.reason, note, snapshot: snapshot as never },
    update: { reason: input.reason, note, snapshot: snapshot as never, status: "OPEN", resolvedAt: null },
  });

  // Yöneticiye e-posta (gönderilemese de bildirim kaydedilmiştir).
  try {
    const options = snapshot.options as string[];
    await sendAdminAlertEmail(
      `🚩 Soru bildirimi: ${String(snapshot.prompt).slice(0, 60)}`,
      [
        `Bildiren: ${session.user.name ?? "-"}`,
        `Sebep: ${input.reason}${note ? ` — "${note}"` : ""}`,
        `Kaynak: ${snapshot.source}`,
        "",
        `Soru: ${snapshot.prompt}`,
        ...options.map((o, i) => `${"ABCD"[i]}) ${o}${"ABCD"[i] === snapshot.correct ? "   ← işaretli doğru cevap" : ""}`),
        "",
        "Admin > Soru Bildirimleri sayfasından inceleyebilirsiniz.",
      ].join("\n")
    );
  } catch (error) {
    console.error("Soru bildirimi e-postası gönderilemedi:", error);
  }

  return { ok: true };
}
