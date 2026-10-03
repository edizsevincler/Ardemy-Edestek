// Kaynak takibi: siteye ?src=instagram (ya da utm_source) ile gelen ziyaretçinin
// kaynağı 30 günlük birinci taraf bir çerezde tutulur (ilk dokunuş geçerlidir)
// ve kayıt olunca User.signupSource alanına yazılır. İstemci ve sunucudan
// import edilebilir (prisma yok).

export const SOURCE_COOKIE = "ardemy_src";
export const SOURCE_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;

// Yalnızca küçük harf, rakam, tire ve alt çizgi; en fazla 32 karakter.
export function sanitizeSource(value: string | null | undefined): string | null {
  if (!value) return null;
  const cleaned = value.toLowerCase().trim().replace(/[^a-z0-9_-]/g, "");
  return cleaned.length > 0 ? cleaned.slice(0, 32) : null;
}

// Admin sayfasında gösterilen okunaklı adlar.
export const SOURCE_LABELS: Record<string, string> = {
  instagram: "Instagram (profil linki)",
  "instagram-story": "Instagram hikâye linki",
  "instagram-reklam": "Instagram reklamı",
  tiktok: "TikTok",
  youtube: "YouTube",
  whatsapp: "WhatsApp kanalı",
  "arkadas-linki": "Arkadaşını Getir linki",
  google: "Google",
};

export function sourceLabel(source: string | null) {
  if (!source) return "Doğrudan / bilinmiyor";
  return SOURCE_LABELS[source] ?? source;
}
