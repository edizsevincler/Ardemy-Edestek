import { ImageResponse } from "next/og";
import { getOgAssets } from "@/lib/og/assets";

const SIZES = [192, 512];

// Uygulama simgesi: marka renginde zemin üzerinde logo (kenarlarda güvenli boşluk
// bırakıldığı için "maskable" kullanımda da kırpılmaz).
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ size: string }> }
) {
  const size = Number((await params).size);
  if (!SIZES.includes(size)) return new Response("Not found", { status: 404 });

  const { logo } = await getOgAssets();
  const box = Math.round(size * 0.62);
  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(160deg, #1c1147 0%, #3c2996 100%)",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logo}
          width={box}
          height={box}
          alt=""
          style={{ borderRadius: Math.round(box * 0.22), background: "white" }}
        />
      </div>
    ),
    {
      width: size,
      height: size,
      headers: { "Cache-Control": "public, max-age=604800, s-maxage=604800" },
    }
  );
}
