"use client";

import { deleteLessonFile } from "./actions";

export function DeleteButton({ id }: { id: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        if (confirm("Bu dosyayı silmek istediğinize emin misiniz?")) {
          deleteLessonFile(id);
        }
      }}
      className="text-red-600 underline hover:text-red-800"
    >
      Sil
    </button>
  );
}
