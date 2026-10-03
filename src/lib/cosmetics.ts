// Mağazadaki unvan ve çerçeve tanımları. Veritabanında yalnızca id tutulur
// (UserCosmetic.itemId, User.equippedTitle/equippedFrame); fiyat ve görünüm
// buradan okunur. İstemci tarafından da import edilebilir (prisma yok).

import { tx } from "@/lib/i18n/translate";

export type Title = { id: string; emoji: string; label: string; price: number };
export type Frame = {
  id: string;
  label: string;
  price: number;
  // Avatarın dış halkası (Tailwind sınıfları — dosya taramasında görünsün diye
  // tam yazılmış durumda).
  ring: string;
};

export const TITLES: Title[] = [
  { id: "kelime-avcisi", emoji: "🏹", label: tx("Kelime Avcısı"), price: 2 },
  { id: "gramer-dehasi", emoji: "🧠", label: tx("Gramer Dehası"), price: 2 },
  { id: "dil-kasifi", emoji: "🧭", label: tx("Dil Kâşifi"), price: 2 },
  { id: "seri-katili", emoji: "🔥", label: tx("Seri Katili"), price: 3 },
  { id: "polyglot", emoji: "🌍", label: tx("Polyglot"), price: 3 },
  { id: "efsane", emoji: "👑", label: tx("Efsane"), price: 5 },
];

export const FRAMES: Frame[] = [
  {
    id: "altin",
    label: tx("Altın"),
    price: 2,
    ring: "ring-2 ring-gold-400",
  },
  {
    id: "gokyuzu",
    label: tx("Gökyüzü"),
    price: 2,
    ring: "ring-2 ring-sky-400",
  },
  {
    id: "zumrut",
    label: tx("Zümrüt"),
    price: 2,
    ring: "ring-2 ring-emerald-400",
  },
  {
    id: "gul",
    label: tx("Gül"),
    price: 3,
    ring: "ring-[3px] ring-rose-400",
  },
  {
    id: "alev",
    label: tx("Alev"),
    price: 4,
    ring: "ring-[3px] ring-orange-500 shadow-[0_0_10px_2px_rgba(249,115,22,0.6)]",
  },
  {
    id: "elmas",
    label: tx("Elmas"),
    price: 4,
    ring: "ring-[3px] ring-cyan-300 shadow-[0_0_12px_3px_rgba(103,232,249,0.7)]",
  },
];

export function findTitle(id: string | null | undefined) {
  return TITLES.find((t) => t.id === id) ?? null;
}

export function findFrame(id: string | null | undefined) {
  return FRAMES.find((f) => f.id === id) ?? null;
}

export function findCosmetic(id: string) {
  const title = TITLES.find((t) => t.id === id);
  if (title) return { kind: "title" as const, price: title.price };
  const frame = FRAMES.find((f) => f.id === id);
  if (frame) return { kind: "frame" as const, price: frame.price };
  return null;
}
