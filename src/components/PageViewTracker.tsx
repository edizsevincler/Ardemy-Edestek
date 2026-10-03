"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

// Herkese açık sayfa gösterimlerini anonim olarak sayar (çerez/kimlik yok).
export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    try {
      fetch("/api/pv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path: pathname }),
        keepalive: true,
      }).catch(() => {});
    } catch {
      // yok sayılır
    }
  }, [pathname]);

  return null;
}
