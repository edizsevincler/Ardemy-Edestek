"use client";

import { deleteQuestion } from "./actions";

export function DeleteButton({ id }: { id: string }) {
  return (
    <button
      type="button"
      onClick={async () => {
        if (!confirm("Bu soruyu silmek istediğinize emin misiniz?")) return;
        const result = await deleteQuestion(id);
        if (!result.deleted) {
          alert(
            `Bu soruyu ${result.unlockCount} kullanıcı kredi ile açtığı için silinemedi, bunun yerine yayından kaldırıldı.`
          );
        }
      }}
      className="text-red-600 underline hover:text-red-800"
    >
      Sil
    </button>
  );
}
