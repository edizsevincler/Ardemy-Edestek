"use client";

import { useState, useTransition } from "react";
import { reportQuestion } from "@/lib/report-actions";
import { REPORT_REASONS } from "@/lib/report-reasons";
import { useT } from "@/lib/i18n/client";

// Çözülmüş bir sorunun altındaki küçük "Soruyu bildir" bağlantısı: sebep seçilir,
// isteğe bağlı not yazılır, yönetici bilgilendirilir.
export function ReportQuestionButton({
  kind,
  itemId,
}: {
  kind: "quiz" | "exam";
  itemId: string;
}) {
  const t = useT();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState<string>(REPORT_REASONS[0]);
  const [note, setNote] = useState("");
  const [status, setStatus] = useState<"idle" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  if (status === "sent") {
    return <p className="mt-2 text-xs text-green-600">{t("Teşekkürler! Bildirimin için sağ ol, inceleyeceğiz.")}</p>;
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-2 text-xs text-slate-400 underline-offset-2 hover:text-slate-600 hover:underline"
      >
        {t("🚩 Soruyu bildir")}
      </button>
    );
  }

  function send() {
    setError(null);
    startTransition(async () => {
      const result = await reportQuestion({ kind, itemId, reason, note });
      if (result.ok) setStatus("sent");
      else setError(result.message);
    });
  }

  return (
    <div className="mt-2 space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
      <p className="text-xs font-medium text-slate-600">{t("Sorunun neresi hatalı?")}</p>
      <select
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm"
      >
        {REPORT_REASONS.map((r) => (
          <option key={r} value={r}>
            {t(r)}
          </option>
        ))}
      </select>
      <textarea
        value={note}
        onChange={(e) => setNote(e.target.value)}
        maxLength={300}
        rows={2}
        placeholder={t("Eklemek istediğin not (isteğe bağlı)")}
        className="w-full rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm"
      />
      {error && <p className="text-xs text-red-600">{error}</p>}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={send}
          disabled={isPending}
          className="rounded-md bg-brand-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-60"
        >
          {isPending ? t("Gönderiliyor...") : t("Gönder")}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-xs text-slate-600"
        >
          {t("Vazgeç")}
        </button>
      </div>
    </div>
  );
}
