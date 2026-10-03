import type { NextConfig } from "next";

// Tarayıcıya ek koruma talimatları (HSTS Vercel tarafından zaten ekleniyor).
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  // Paylaşım/sosyal medya görselleri (next/og) yazı tiplerini ve logoyu
  // çalışma anında dosyadan okur; Vercel'e eksiksiz taşınmaları için açıkça
  // dahil edilir.
  outputFileTracingIncludes: {
    "/api/share/**": ["./src/lib/og/**"],
    "/api/admin/social/**": ["./src/lib/og/**"],
    "/api/poster/**": ["./src/lib/og/**"],
    "/pwa-icon/**": ["./src/lib/og/**"],
    "/apple-icon": ["./src/lib/og/**"],
    "/opengraph-image": ["./src/lib/og/**"],
    "/dene/opengraph-image": ["./src/lib/og/**"],
    "/dene/[language]/opengraph-image": ["./src/lib/og/**"],
    "/link/opengraph-image": ["./src/lib/og/**"],
    "/rusca-alfabe/opengraph-image": ["./src/lib/og/**"],
  },
};

export default nextConfig;
