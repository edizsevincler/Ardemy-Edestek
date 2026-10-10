"use client";

import { useTransition } from "react";
import { deleteCardWord } from "./actions";

export function DeleteWordButton({ id, label }: { id: string; label: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (confirm(`"${label}" kelimesi tüm kullanıcıların kartlarından silinsin mi?`)) {
          start(() => deleteCardWord(id));
        }
      }}
      className="text-xs font-medium text-red-600 hover:underline disabled:opacity-50"
    >
      {pending ? "Siliniyor..." : "Sil"}
    </button>
  );
}
