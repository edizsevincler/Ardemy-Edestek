"use client";

import { useState } from "react";

// Görseli (story boyutu) üretip cihazın paylaşım menüsünü açar (mobilde
// Instagram/WhatsApp vb.). Dosya paylaşımı desteklenmiyorsa görsel indirilir.
export function ShareButton({
  imagePath,
  filename,
  text,
  label = "Paylaş",
  small = false,
}: {
  imagePath: string;
  filename: string;
  text: string;
  label?: string;
  small?: boolean;
}) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function share() {
    setBusy(true);
    setMessage(null);
    try {
      const sep = imagePath.includes("?") ? "&" : "?";
      const res = await fetch(`${imagePath}${sep}format=story`);
      if (!res.ok) throw new Error("image");
      const blob = await res.blob();
      const file = new File([blob], filename, { type: "image/png" });

      if (navigator.canShare?.({ files: [file] })) {
        try {
          await navigator.share({ files: [file], text });
          return;
        } catch (error) {
          // Kullanıcı paylaşım menüsünü kapattıysa sessizce çık.
          if (error instanceof DOMException && error.name === "AbortError") return;
          throw error;
        }
      }

      const href = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(href);
      setMessage("Görsel indirildi — Instagram veya WhatsApp'ta paylaşabilirsin.");
    } catch {
      setMessage("Görsel hazırlanamadı, biraz sonra tekrar dene.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={share}
        disabled={busy}
        className={`rounded-lg border border-brand-200 bg-white font-medium text-brand-700 transition-colors hover:bg-brand-50 disabled:opacity-50 ${
          small ? "px-2 py-0.5 text-xs" : "px-4 py-2 text-sm"
        }`}
      >
        {busy ? "Hazırlanıyor..." : `📤 ${label}`}
      </button>
      {message && <span className="text-xs text-slate-500">{message}</span>}
    </span>
  );
}
