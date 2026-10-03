import { CHIP_RU, PAGE_CARD_SIZE, pageCard } from "@/lib/og/page-card";

export const alt = "Rusça alfabe (Kiril): 33 harfin okunuşu — Ardemy Academy";
export const size = PAGE_CARD_SIZE;
export const contentType = "image/png";

export default function Image() {
  return pageCard({
    title: "Rusça Alfabe (Kiril)",
    subtitle: "33 harfin okunuşu ve örnek kelimeler",
    chips: [CHIP_RU],
  });
}
