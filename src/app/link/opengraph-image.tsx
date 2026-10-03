import { CHIP_EN, CHIP_RU, PAGE_CARD_SIZE, pageCard } from "@/lib/og/page-card";
import { INSTAGRAM_HANDLE } from "@/lib/site";

export const alt = "Ardemy Academy bağlantıları";
export const size = PAGE_CARD_SIZE;
export const contentType = "image/png";

export default function Image() {
  return pageCard({
    title: "Rusça ve İngilizce, her gün 5 dakika",
    subtitle: "Ücretsiz testler, kayıt ve iletişim",
    chips: [CHIP_RU, CHIP_EN],
    footer: INSTAGRAM_HANDLE,
  });
}
