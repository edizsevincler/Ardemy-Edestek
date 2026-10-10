"use client";

import { useState, type ComponentProps } from "react";
import { useT } from "@/lib/i18n/client";

// Şifre alanı: sağdaki göz düğmesiyle yazılanı göster/gizle.
export function PasswordInput({ className = "", ...props }: Omit<ComponentProps<"input">, "type">) {
  const t = useT();
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <input
        {...props}
        type={visible ? "text" : "password"}
        autoCapitalize="none"
        autoCorrect="off"
        spellCheck={false}
        className={`${className} pr-11`}
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? t("Şifreyi gizle") : t("Şifreyi göster")}
        aria-pressed={visible}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-slate-400 transition-colors hover:text-brand-600 focus-visible:text-brand-600"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          {visible ? (
            <>
              <path d="M3 3l18 18" />
              <path d="M10.6 6.1A9.9 9.9 0 0 1 12 6c5 0 8.6 3.6 10 6-0.6 1.1-1.6 2.4-3 3.5M6.4 7.6C4.5 8.9 3.1 10.7 2 12c1.4 2.4 5 6 10 6 1.5 0 2.8-.3 4-.8" />
              <path d="M9.9 9.9a3 3 0 0 0 4.2 4.2" />
            </>
          ) : (
            <>
              <path d="M2 12c1.4-2.4 5-6 10-6s8.6 3.6 10 6c-1.4 2.4-5 6-10 6S3.4 14.4 2 12z" />
              <circle cx="12" cy="12" r="3" />
            </>
          )}
        </svg>
      </button>
    </div>
  );
}
