"use client";

import { useActionState, useEffect, useRef } from "react";
import { addCardWords } from "./actions";
import { CARD_LEVELS, CARD_TOPICS } from "@/lib/card-meta";

const initialState = { status: "idle" } as const;

export function WordForm() {
  const [state, formAction, isPending] = useActionState(addCardWords, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") formRef.current?.reset();
  }, [state]);

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-5">
      <h2 className="font-medium text-slate-900">Kelime Ekle</h2>
      <form ref={formRef} action={formAction} className="mt-3 space-y-3">
        <fieldset className="flex flex-wrap items-center gap-4">
          <legend className="sr-only">Dil</legend>
          <span className="text-sm font-medium text-slate-700">Dil:</span>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="radio" name="language" value="EN" defaultChecked /> İngilizce
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="radio" name="language" value="RU" /> Rusça
          </label>
        </fieldset>
        <fieldset className="flex flex-wrap items-center gap-4">
          <legend className="sr-only">Seviye</legend>
          <span className="text-sm font-medium text-slate-700">Seviye:</span>
          {CARD_LEVELS.map((level) => (
            <label key={level.id} className="flex items-center gap-2 text-sm text-slate-700">
              <input type="radio" name="level" value={level.id} defaultChecked={level.id === "A1"} /> {level.id}
            </label>
          ))}
        </fieldset>
        <div className="flex flex-wrap items-center gap-2">
          <label htmlFor="topic" className="text-sm font-medium text-slate-700">
            Konu:
          </label>
          <select
            id="topic"
            name="topic"
            defaultValue="verbs"
            className="rounded-md border border-slate-300 px-3 py-1.5 text-sm outline-none focus:border-slate-500"
          >
            {CARD_TOPICS.map((topic) => (
              <option key={topic.id} value={topic.id}>
                {topic.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="words" className="text-sm font-medium text-slate-700">
            Kelimeler (her satıra bir tane: Türkçe = yabancı dil)
          </label>
          <textarea
            id="words"
            name="words"
            required
            rows={7}
            placeholder={"kedi = cat\nkarar vermek = to decide\nsu = water"}
            className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 font-mono text-sm outline-none focus:border-slate-500"
          />
          <p className="mt-1 text-xs text-slate-500">
            Soldaki taraf kartın önü, sağdaki arkası olur. Seçtiğin dilin ve seviyenin kartlarına eklenir ve tüm kullanıcılara (öğrenci + misafir) açılır. Aynı kelime zaten varsa tekrar eklenmez.
          </p>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-brand-900/20 transition-all duration-200 hover:from-brand-500 hover:to-brand-400 active:scale-95 disabled:opacity-60"
        >
          {isPending ? "Ekleniyor..." : "Ekle"}
        </button>

        {state.status === "error" && <p className="text-sm text-red-600">{state.message}</p>}
        {state.status === "success" && (
          <div className="space-y-1 text-sm">
            <p className="text-emerald-600">
              {state.added} yeni kelime eklendi
              {state.duplicates > 0 ? `, ${state.duplicates} kelime zaten vardı` : ""}.
            </p>
            {state.skipped.length > 0 && (
              <div className="text-amber-700">
                <p>{state.skipped.length} satır atlandı (&quot;=&quot; yok, boş veya çok uzun):</p>
                <ul className="list-inside list-disc font-mono text-xs">
                  {state.skipped.slice(0, 8).map((line, i) => (
                    <li key={i}>{line}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
