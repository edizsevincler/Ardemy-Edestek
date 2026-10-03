"use client";

import { useEffect } from "react";

// Servis çalışanını yalnızca yayında kaydeder (geliştirmede önbellek karışmasın).
export function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js").catch(() => {});
  }, []);
  return null;
}
