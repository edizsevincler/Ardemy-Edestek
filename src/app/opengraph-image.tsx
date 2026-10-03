import { ImageResponse } from "next/og";
import { getOgAssets } from "@/lib/og/assets";
import { SITE_HOST } from "@/lib/site";

export const alt = "Ardemy Academy — dil öğrenmenin en pratik yolu";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const { fonts, logo } = await getOgAssets();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          background: "linear-gradient(160deg, #1c1147 0%, #2f2178 55%, #4b32b3 100%)",
          color: "white",
          fontFamily: "Inter",
          textAlign: "center",
          padding: 60,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo} width={130} height={130} alt="" style={{ borderRadius: 28 }} />
        <div style={{ display: "flex", fontSize: 76, fontWeight: 700, marginTop: 36 }}>
          Ardemy Academy
        </div>
        <div style={{ display: "flex", fontSize: 40, color: "#e8c25a", marginTop: 16 }}>
          Dil öğrenmenin en pratik yolu
        </div>
        <div style={{ display: "flex", fontSize: 32, color: "#cfc4f2", marginTop: 28 }}>
          Rusça ve İngilizce testler, günlük soru, deneme sınavları
        </div>
        <div style={{ display: "flex", fontSize: 28, color: "#cfc4f2", marginTop: 40 }}>
          {SITE_HOST}
        </div>
      </div>
    ),
    { ...size, fonts }
  );
}
