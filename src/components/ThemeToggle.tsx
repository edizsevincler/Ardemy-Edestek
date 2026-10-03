"use client";

import { useSyncExternalStore } from "react";
import { useT } from "@/lib/i18n/client";

// Tema tercihi localStorage'da ("light" | "dark") tutulur; kayıt yoksa
// cihazın ayarı geçerlidir. Sayfa boyanmadan önce layout.tsx'teki betik
// <html> öğesine "dark" sınıfını ekler, bu düğme yalnızca değiştirir.
export const THEME_STORAGE_KEY = "ardemy_theme";

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

const isDark = () => document.documentElement.classList.contains("dark");

export function ThemeToggle({ tone = "dark" }: { tone?: "dark" | "light" }) {
  const t = useT();
  const dark = useSyncExternalStore(subscribe, isDark, () => false);

  function toggle() {
    const next = !isDark();
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next ? "dark" : "light");
    } catch {
      // depolama kapalıysa tercih yalnızca bu sayfada geçerli olur
    }
  }

  const label = dark ? t("Açık moda geç") : t("Koyu moda geç");
  const style =
    tone === "dark"
      ? "border-white/30 text-white hover:bg-white/10"
      : "border-slate-300 text-slate-600 hover:bg-slate-100";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors ${style}`}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        {dark ? (
          <>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6 7 7M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" />
          </>
        ) : (
          <path d="M20 14.5A8 8 0 0 1 9.5 4 8 8 0 1 0 20 14.5Z" />
        )}
      </svg>
    </button>
  );
}
