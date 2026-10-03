import { ImageResponse } from "next/og";
import type { ReactElement } from "react";
import { getOgAssets, OG_FORMATS, type OgFormat } from "@/lib/og/assets";

// Kart görselini PNG olarak döndürür. Kişisel/yönetici içeriği olduğu için
// önbelleğe alınmaz; `download` verilirse tarayıcı dosyayı indirir.
export async function ogResponse(
  build: (ctx: {
    size: { width: number; height: number };
    logo: string;
  }) => ReactElement,
  format: OgFormat,
  filename: string,
  download: boolean
) {
  const { fonts, logo } = await getOgAssets();
  const size = OG_FORMATS[format];
  return new ImageResponse(build({ size, logo }), {
    ...size,
    fonts,
    headers: {
      "Cache-Control": "private, no-store",
      ...(download
        ? { "Content-Disposition": `attachment; filename="${filename}"` }
        : {}),
    },
  });
}
