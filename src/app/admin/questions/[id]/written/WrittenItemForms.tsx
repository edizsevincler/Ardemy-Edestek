"use client";

import { useActionState, useEffect, useRef, useTransition } from "react";
import { addWrittenItem, deleteWrittenItem, updateWrittenItem } from "./actions";

const initialState = { status: "idle" } as const;
const inputClass =
  "mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100";
const buttonClass =
  "rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:from-brand-500 hover:to-brand-400 active:scale-95 disabled:opacity-60";

export function AddWrittenItemForm({ questionId }: { questionId: string }) {
  const [state, formAction, isPending] = useActionState(addWrittenItem, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-3 rounded-xl border border-brand-100 bg-white p-5 shadow-sm">
      <h2 className="font-medium text-brand-950">Soru Ekle</h2>
      <input type="hidden" name="questionId" value={questionId} />
      <div>
        <label className="text-sm font-medium text-slate-700">Soru</label>
        <textarea name="prompt" required rows={3} className={inputClass} />
      </div>
      <div>
        <label className="text-sm font-medium text-slate-700">Örnek / doğru cevap (isteğe bağlı)</label>
        <textarea name="answer" rows={2} className={inputClass} />
        <p className="mt-1 text-xs text-slate-500">Öğrenci testi gönderdikten sonra kendi cevabıyla karşılaştırması için gösterilir.</p>
      </div>
      <button type="submit" disabled={isPending} className={buttonClass}>
        {isPending ? "Ekleniyor..." : "Soruyu Ekle"}
      </button>
      {state.status === "error" && <p className="text-sm text-red-600">{state.message}</p>}
      {state.status === "success" && <p className="text-sm text-emerald-600">Eklendi.</p>}
    </form>
  );
}

export function EditWrittenItemForm({
  item,
}: {
  item: { id: string; order: number; prompt: string; answer: string | null };
}) {
  const [state, formAction, isPending] = useActionState(updateWrittenItem, initialState);
  const [deleting, startDelete] = useTransition();

  return (
    <form action={formAction} className="space-y-2 rounded-xl border border-brand-100 bg-white p-4 shadow-sm">
      <input type="hidden" name="id" value={item.id} />
      <p className="text-sm font-semibold text-brand-700">{item.order}. soru</p>
      <textarea name="prompt" required rows={3} defaultValue={item.prompt} className={inputClass} />
      <textarea
        name="answer"
        rows={2}
        defaultValue={item.answer ?? ""}
        placeholder="Örnek / doğru cevap (isteğe bağlı)"
        className={inputClass}
      />
      <div className="flex items-center gap-3">
        <button type="submit" disabled={isPending} className={buttonClass}>
          {isPending ? "Kaydediliyor..." : "Kaydet"}
        </button>
        <button
          type="button"
          disabled={deleting}
          onClick={() => {
            if (confirm(`${item.order}. soru silinsin mi?`)) startDelete(() => deleteWrittenItem(item.id));
          }}
          className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50"
        >
          {deleting ? "Siliniyor..." : "Sil"}
        </button>
        {state.status === "success" && <span className="text-xs text-emerald-600">Kaydedildi</span>}
        {state.status === "error" && <span className="text-xs text-red-600">{state.message}</span>}
      </div>
    </form>
  );
}
