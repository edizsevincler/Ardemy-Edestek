"use client";

import { toggleCreditPackageActive } from "./actions";

export function ToggleActiveButton({
  id,
  isActive,
}: {
  id: string;
  isActive: boolean;
}) {
  return (
    <button
      type="button"
      onClick={() => toggleCreditPackageActive(id, !isActive)}
      className={
        isActive
          ? "text-slate-600 underline hover:text-slate-900"
          : "text-brand-600 underline hover:text-brand-800"
      }
    >
      {isActive ? "Pasifleştir" : "Aktifleştir"}
    </button>
  );
}
