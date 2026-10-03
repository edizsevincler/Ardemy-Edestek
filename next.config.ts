import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Paylaşım/sosyal medya görselleri (next/og) yazı tiplerini ve logoyu
  // çalışma anında dosyadan okur; Vercel'e eksiksiz taşınmaları için açıkça
  // dahil edilir.
  outputFileTracingIncludes: {
    "/api/share/**": ["./src/lib/og/**"],
    "/api/admin/social/**": ["./src/lib/og/**"],
    "/api/poster/**": ["./src/lib/og/**"],
    "/pwa-icon/**": ["./src/lib/og/**"],
    "/apple-icon": ["./src/lib/og/**"],
  },
};

export default nextConfig;
