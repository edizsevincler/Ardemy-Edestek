"use client";

import { useEffect, useState, useTransition } from "react";
import { removePushSubscription, savePushSubscription, setReminderHour } from "@/lib/push-actions";
import { useT } from "@/lib/i18n/client";

const HOURS = Array.from({ length: 16 }, (_, i) => i + 8); // 08:00 – 23:00
const DISMISS_KEY = "ardemy_push_dismissed";
const DISMISS_DAYS = 14;

type Status = "loading" | "unsupported" | "ios-install" | "denied" | "off" | "on" | "dismissed";

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + padding).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

async function getRegistration() {
  const existing = await navigator.serviceWorker.getRegistration();
  if (existing) return existing;
  await navigator.serviceWorker.register("/sw.js");
  return navigator.serviceWorker.ready;
}

// Günlük hatırlatma: kullanıcı bildirim izni verir, saatini seçer; her gün o saatte
// (günün sorusunu çözmediyse) telefonuna/tarayıcısına bildirim gelir.
export function PushReminderCard({
  initialHour,
  publicKey,
}: {
  initialHour: number;
  publicKey: string | null;
}) {
  const t = useT();
  const [status, setStatus] = useState<Status>("loading");
  const [hour, setHour] = useState(initialHour);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const ua = navigator.userAgent;
      const ios = /iPhone|iPad|iPod/.test(ua);
      const standalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (navigator as unknown as { standalone?: boolean }).standalone === true;
      const supported =
        !!publicKey && "serviceWorker" in navigator && "PushManager" in window && "Notification" in window;

      let next: Status;
      if (!supported) next = ios && !standalone ? "ios-install" : "unsupported";
      else if (Notification.permission === "denied") next = "denied";
      else {
        const reg = await navigator.serviceWorker.getRegistration();
        const sub = await reg?.pushManager.getSubscription();
        if (sub && Notification.permission === "granted") next = "on";
        else {
          let dismissedAt = 0;
          try {
            dismissedAt = Number(localStorage.getItem(DISMISS_KEY) ?? 0);
          } catch {
            // depolama kapalıysa kart her seferinde görünür
          }
          next = Date.now() - dismissedAt < DISMISS_DAYS * 86_400_000 ? "dismissed" : "off";
        }
      }
      if (!cancelled) setStatus(next);
    })();
    return () => {
      cancelled = true;
    };
  }, [publicKey]);

  function enable() {
    setError(null);
    startTransition(async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted") {
          setStatus(permission === "denied" ? "denied" : "off");
          return;
        }
        const reg = await getRegistration();
        const sub =
          (await reg.pushManager.getSubscription()) ??
          (await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(publicKey!),
          }));
        const json = sub.toJSON() as { endpoint: string; keys: { p256dh: string; auth: string } };
        const result = await savePushSubscription(json, hour);
        if (!result.ok) throw new Error("save");
        setStatus("on");
      } catch {
        setError(t("Bildirim açılamadı, biraz sonra tekrar dene."));
      }
    });
  }

  function disable() {
    setError(null);
    startTransition(async () => {
      try {
        const reg = await navigator.serviceWorker.getRegistration();
        const sub = await reg?.pushManager.getSubscription();
        if (sub) {
          await removePushSubscription(sub.endpoint);
          await sub.unsubscribe();
        }
        setStatus("off");
      } catch {
        setError(t("Bildirim kapatılamadı, biraz sonra tekrar dene."));
      }
    });
  }

  function changeHour(next: number) {
    setHour(next);
    if (status === "on") startTransition(async () => void (await setReminderHour(next)));
  }

  function dismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, String(Date.now()));
    } catch {
      // önemli değil
    }
    setStatus("dismissed");
  }

  if (status === "loading" || status === "unsupported" || status === "dismissed") return null;

  const hourSelect = (
    <select
      value={hour}
      onChange={(e) => changeHour(Number(e.target.value))}
      disabled={isPending}
      aria-label={t("Hatırlatma saati")}
      className="rounded-md border border-slate-300 bg-white px-2 py-1.5 text-sm"
    >
      {HOURS.map((h) => (
        <option key={h} value={h}>
          {String(h).padStart(2, "0")}:00
        </option>
      ))}
    </select>
  );

  return (
    <div className="rounded-xl border border-brand-100 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-medium text-brand-950">{t("🔔 Günlük hatırlatma")}</h2>
        {status === "off" && (
          <button
            type="button"
            onClick={dismiss}
            className="text-xs text-slate-400 hover:text-slate-600"
          >
            {t("Şimdi değil")}
          </button>
        )}
      </div>

      {status === "ios-install" && (
        <p className="mt-2 text-sm text-slate-600">
          {t("iPhone'da bildirim için siteyi ana ekrana ekle (Paylaş → Ana Ekrana Ekle), sonra uygulamayı oradan aç.")}
        </p>
      )}

      {status === "denied" && (
        <p className="mt-2 text-sm text-slate-600">
          {t("Bildirimler tarayıcı ayarlarından kapatılmış. Açmak için adres çubuğundaki kilit simgesine dokunup bildirimlere izin ver.")}
        </p>
      )}

      {status === "off" && (
        <>
          <p className="mt-2 text-sm text-slate-600">
            {t("Günün sorusunu unutma: seçtiğin saatte telefonuna bildirim gelsin. Bugünkü soruyu çözdüysen rahatsız etmeyiz.")}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {hourSelect}
            <button
              type="button"
              onClick={enable}
              disabled={isPending}
              className="rounded-lg bg-gradient-to-r from-gold-500 to-gold-400 px-4 py-2 text-sm font-semibold text-brand-950 shadow-sm transition-all duration-200 hover:scale-[1.03] active:scale-95 disabled:opacity-60"
            >
              {isPending ? t("Bildirim açılıyor...") : t("Bildirimi aç")}
            </button>
          </div>
        </>
      )}

      {status === "on" && (
        <>
          <p className="mt-2 text-sm text-green-700">
            {t("✓ Açık. Her gün bu saatte hatırlatılırsın:")}
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-3">
            {hourSelect}
            <button
              type="button"
              onClick={disable}
              disabled={isPending}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50 disabled:opacity-60"
            >
              {t("Kapat")}
            </button>
          </div>
        </>
      )}

      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
