// Herkese açık site adresi (sitemap, paylaşım metinleri). Vercel'de
// NEXT_PUBLIC_APP_URL tanımlı; yerelde canlı adrese düşer.
export const SITE_URL = (
  process.env.NEXT_PUBLIC_APP_URL ?? "https://ardemy-edestek.vercel.app"
).replace(/\/$/, "");

// Paylaşım kartları ve açıklamalarda görünen Instagram hesabı.
export const INSTAGRAM_HANDLE = "@edizsevincler";

export const SITE_HOST = SITE_URL.replace(/^https?:\/\//, "");
