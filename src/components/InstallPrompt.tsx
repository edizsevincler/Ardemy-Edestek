"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useT } from "@/lib/i18n/client";

type InstallEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
};

const DISMISS_KEY = "ardemy-install-dismissed";

// Ana sayfada (panel) "ana ekrana ekle" önerisi: Android/Chrome'da tek dokunuşla
// yükleme, iPhone'da Safari talimatı. Kapatılırsa bir daha gösterilmez.
export function InstallPrompt() {
  const t = useT();
  const pathname = usePathname();
  const [deferred, setDeferred] = useState<InstallEvent | null>(null);
  const [ios, setIos] = useState(false);
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    try {
      if (localStorage.getItem(DISMISS_KEY)) return;
    } catch {
      // localStorage yoksa öneri her seferinde gösterilir
    }
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    if (standalone) return;

    const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIos(isIos);
    if (isIos) setHidden(false);

    const onPrompt = (event: Event) => {
      event.preventDefault();
      setDeferred(event as InstallEvent);
      setHidden(false);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (hidden || (pathname !== "/guest" && pathname !== "/student")) return null;

  function dismiss() {
    setHidden(true);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      // yok sayılır
    }
  }

  async function install() {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice.catch(() => null);
    dismiss();
  }

  return (
    <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-brand-200 bg-brand-50 p-4 text-sm text-brand-900">
      <div className="min-w-0 flex-1">
        <p className="font-medium">{t("📲 Uygulama gibi kullan")}</p>
        <p className="mt-0.5 text-slate-600">
          {ios && !deferred
            ? t("iPhone'da: Safari'de Paylaş düğmesine, ardından \"Ana Ekrana Ekle\"ye dokun.")
            : t("Siteyi ana ekranına ekle: tek dokunuşla aç, günlük sorunu ve serini kaçırma.")}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {deferred && (
          <button
            type="button"
            onClick={install}
            className="rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-3 py-1.5 font-medium text-white"
          >
            {t("Ana ekrana ekle")}
          </button>
        )}
        <button
          type="button"
          onClick={dismiss}
          className="rounded-lg border border-brand-200 px-3 py-1.5 text-brand-700 hover:bg-white"
        >
          {t("Kapat")}
        </button>
      </div>
    </div>
  );
}
