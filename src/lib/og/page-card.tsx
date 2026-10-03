import { ImageResponse } from "next/og";
import { getOgAssets, OG_FONT_FAMILY } from "@/lib/og/assets";
import { SITE_HOST } from "@/lib/site";

// Sayfa bağlantılarının (WhatsApp, Instagram, X...) önizleme görseli: her
// sayfa kendi başlığıyla aynı marka şablonunu kullanır.
export const PAGE_CARD_SIZE = { width: 1200, height: 630 };

export type PageCardChip = { label: string; background: string; color: string };

export const CHIP_RU: PageCardChip = { label: "RU", background: "#d52b1e", color: "#ffffff" };
export const CHIP_EN: PageCardChip = { label: "EN", background: "#1d4ed8", color: "#ffffff" };

export async function pageCard({
  title,
  subtitle,
  chips = [],
  footer = SITE_HOST,
}: {
  title: string;
  subtitle: string;
  chips?: PageCardChip[];
  footer?: string;
}) {
  const { fonts, logo } = await getOgAssets();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(160deg, #1c1147 0%, #2f2178 55%, #4b32b3 100%)",
          color: "white",
          fontFamily: OG_FONT_FAMILY,
          padding: 70,
        }}
      >
        <div style={{ display: "flex", alignItems: "center" }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={logo} width={84} height={84} alt="" style={{ borderRadius: 20 }} />
          <div style={{ display: "flex", fontSize: 36, fontWeight: 700, marginLeft: 22 }}>
            Ardemy Academy
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", fontSize: 76, fontWeight: 700, lineHeight: 1.1 }}>
            {title}
          </div>
          <div style={{ display: "flex", fontSize: 38, color: "#e8c25a", marginTop: 22 }}>
            {subtitle}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex" }}>
            {chips.map((chip) => (
              <div
                key={chip.label}
                style={{
                  display: "flex",
                  background: chip.background,
                  color: chip.color,
                  fontSize: 30,
                  fontWeight: 700,
                  padding: "8px 24px",
                  borderRadius: 999,
                  marginRight: 16,
                }}
              >
                {chip.label}
              </div>
            ))}
          </div>
          <div style={{ display: "flex", fontSize: 28, color: "#cfc4f2" }}>{footer}</div>
        </div>
      </div>
    ),
    { ...PAGE_CARD_SIZE, fonts }
  );
}
