"use client";

import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { unlockQuestion } from "./actions";

const initialState = { status: "idle" } as const;

export function UnlockButton({
  questionId,
  creditCost,
}: {
  questionId: string;
  creditCost: number;
}) {
  const [state, formAction, isPending] = useActionState(
    unlockQuestion,
    initialState
  );
  const router = useRouter();

  useEffect(() => {
    if (state.status === "success") {
      router.push(`/guest/questions/${questionId}`);
    }
  }, [state, questionId, router]);

  return (
    <form action={formAction}>
      <input type="hidden" name="questionId" value={questionId} />
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-gradient-to-r from-gold-500 to-gold-400 px-3 py-1.5 text-sm font-semibold text-brand-950 shadow-sm shadow-gold-600/30 transition-all duration-200 hover:from-gold-400 hover:to-gold-300 hover:scale-[1.03] hover:shadow-lg active:scale-95 disabled:opacity-60"
      >
        {isPending
          ? "Açılıyor..."
          : creditCost === 0
            ? "Ücretsiz Aç"
            : `${creditCost} kredi ile aç`}
      </button>
      {state.status === "error" && (
        <p className="mt-1 text-xs text-red-600">{state.message}</p>
      )}
    </form>
  );
}
