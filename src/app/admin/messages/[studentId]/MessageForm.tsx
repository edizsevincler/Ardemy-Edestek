"use client";

import { useActionState, useRef, useEffect } from "react";
import { sendAdminMessage } from "../actions";

const initialState = { status: "idle" } as const;

export function MessageForm({ studentId }: { studentId: string }) {
  const [state, formAction, isPending] = useActionState(
    sendAdminMessage,
    initialState
  );
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.status === "success") {
      formRef.current?.reset();
    }
  }, [state]);

  return (
    <form
      ref={formRef}
      action={formAction}
      className="flex items-end gap-2 border-t border-slate-200 p-4"
    >
      <input type="hidden" name="studentId" value={studentId} />
      <textarea
        name="body"
        required
        rows={2}
        placeholder="Mesajınızı yazın..."
        className="flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
      />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-2 text-sm font-medium text-white shadow-sm shadow-brand-900/20 transition-all duration-200 hover:from-brand-500 hover:to-brand-400 hover:scale-[1.03] hover:shadow-lg active:scale-95 disabled:opacity-60"
      >
        {isPending ? "Gönderiliyor..." : "Gönder"}
      </button>
      {state.status === "error" && (
        <p className="text-sm text-red-600">{state.message}</p>
      )}
    </form>
  );
}
