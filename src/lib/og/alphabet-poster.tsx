// Rusça alfabe posteri (1080x1528, A4 oranı). Kurallar cards.tsx ile aynı.

import { alphabetFor } from "@/lib/alphabet";
import { INSTAGRAM_HANDLE, SITE_HOST } from "@/lib/site";
import { OG_FONT_FAMILY } from "@/lib/og/assets";
import type { TFunction } from "@/lib/i18n/translate";

export const POSTER_SIZE = { width: 1080, height: 1528 };
const GOLD = "#e8c25a";

export function AlphabetPoster({
  logo,
  locale = "tr",
  t = (text: string) => text,
}: {
  logo: string;
  locale?: string;
  t?: TFunction;
}) {
  return (
    <div
      style={{
        width: POSTER_SIZE.width,
        height: POSTER_SIZE.height,
        display: "flex",
        flexDirection: "column",
        background: "linear-gradient(160deg, #1c1147 0%, #2f2178 55%, #4b32b3 100%)",
        color: "white",
        fontFamily: OG_FONT_FAMILY,
        padding: "56px 60px",
      }}
    >
      <div style={{ display: "flex", alignItems: "center" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo} width={84} height={84} alt="" style={{ borderRadius: 20, background: "white" }} />
        <div style={{ display: "flex", flexDirection: "column", marginLeft: 24 }}>
          <div style={{ display: "flex", fontSize: 54, fontWeight: 700 }}>
            {t("Rusça Alfabe (Kiril)")}
          </div>
          <div style={{ display: "flex", fontSize: 28, color: "#cfc4f2" }}>
            {t("33 harf · okunuşu · örnek kelime")}
          </div>
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", marginTop: 28, marginLeft: -5, marginRight: -5 }}>
        {alphabetFor(locale).map((l) => (
          <div
            key={l.upper}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              width: 150,
              height: 176,
              margin: 5,
              padding: "8px 4px",
              borderRadius: 20,
              background: "rgba(255,255,255,0.12)",
              border: "2px solid rgba(255,255,255,0.18)",
            }}
          >
            <div style={{ display: "flex", fontSize: 56, fontWeight: 700 }}>
              {`${l.upper} ${l.lower}`}
            </div>
            <div style={{ display: "flex", fontSize: 30, fontWeight: 700, color: GOLD, marginTop: 2 }}>
              {l.sound}
            </div>
            <div style={{ display: "flex", fontSize: 22, color: "#e7e1fa", marginTop: 6 }}>
              {l.example}
            </div>
            <div style={{ display: "flex", fontSize: 18, color: "#cfc4f2", marginTop: 2 }}>
              {l.meaning}
            </div>
          </div>
        ))}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          marginTop: "auto",
          fontSize: 28,
          color: "#cfc4f2",
        }}
      >
        {`${INSTAGRAM_HANDLE}  ·  ${SITE_HOST}/rusca-alfabe`}
      </div>
    </div>
  );
}
