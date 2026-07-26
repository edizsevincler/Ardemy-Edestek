"use client";

import { useActionState, useRef, useEffect } from "react";
import { createQuestion } from "./actions";

const initialState = { status: "idle" } as const;

export function QuestionForm() {
  const [state, formAction, isPending] = useActionState(
    createQuestion,
    initialState
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <div className="rounded-xl border border-brand-100 bg-white transition-shadow duration-200 hover:shadow-md p-5 shadow-sm">
      <h2 className="font-medium text-brand-950">Yeni Soru Ekle</h2>
      <form ref={formRef} action={formAction} className="mt-3 space-y-3">
        <div>
          <label className="text-sm font-medium text-slate-700">Tür</label>
          <select
            name="type"
            defaultValue="QUESTION"
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          >
            <option value="QUESTION">Soru</option>
            <option value="TOPIC">Konu Anlatımı</option>
          </select>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">Başlık</label>
          <input
            name="title"
            type="text"
            required
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-slate-700">Konu</label>
            <input
              name="subject"
              type="text"
              required
              placeholder="Örn: İngilizce, Rusça"
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">
              Kredi bedeli
            </label>
            <input
              name="creditCost"
              type="number"
              min={0}
              defaultValue={1}
              required
              className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
            />
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">
            Soru metni (opsiyonel)
          </label>
          <textarea
            name="body"
            rows={4}
            className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          />
        </div>

        <div>
          <label className="text-sm font-medium text-slate-700">
            Dosya (opsiyonel)
          </label>
          <input name="file" type="file" className="mt-1 w-full text-sm" />
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input name="isPublished" type="checkbox" />
          Hemen yayınla
        </label>

        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-brand-900/20 transition-all duration-200 hover:from-brand-500 hover:to-brand-400 hover:scale-[1.03] hover:shadow-lg active:scale-95 disabled:opacity-60"
        >
          {isPending ? "Ekleniyor..." : "Soruyu Ekle"}
        </button>

        {state.status === "error" && (
          <p className="text-sm text-red-600">{state.message}</p>
        )}
      </form>
    </div>
  );
}
