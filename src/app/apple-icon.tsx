import { ImageResponse } from "next/og";
import { getOgAssets } from "@/lib/og/assets";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// iPhone ana ekran simgesi.
export default async function AppleIcon() {
  const { logo } = await getOgAssets();
  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(160deg, #1c1147 0%, #3c2996 100%)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={logo} width={116} height={116} alt="" style={{ borderRadius: 26, background: "white" }} />
      </div>
    ),
    size
  );
}
