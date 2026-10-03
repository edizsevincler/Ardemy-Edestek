"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import {
  sanitizeSource,
  SOURCE_COOKIE,
  SOURCE_MAX_AGE_SECONDS,
} from "@/lib/source";

// ?src=... veya ?utm_source=... ile gelen ziyaretçinin kaynağını çereze yazar.
// İlk dokunuş korunur: çerez zaten varsa üzerine yazılmaz.
export function SourceCapture() {
  const params = useSearchParams();

  useEffect(() => {
    const source = sanitizeSource(params.get("src") ?? params.get("utm_source"));
    if (!source) return;
    try {
      if (document.cookie.split("; ").some((c) => c.startsWith(`${SOURCE_COOKIE}=`))) {
        return;
      }
      document.cookie = `${SOURCE_COOKIE}=${source}; path=/; max-age=${SOURCE_MAX_AGE_SECONDS}; samesite=lax`;
    } catch {
      // çerezler kapalıysa kaynak kaydedilmez; site normal çalışır
    }
  }, [params]);

  return null;
}
