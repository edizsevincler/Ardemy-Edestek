import type { MetadataRoute } from "next";

// Telefona "uygulama gibi" eklenebilmesi için web uygulaması bildirimi.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Ardemy Academy",
    short_name: "Ardemy",
    description: "Rusça ve İngilizce testler, günlük soru, deneme sınavları",
    start_url: "/?src=pwa",
    scope: "/",
    display: "standalone",
    background_color: "#1c1147",
    theme_color: "#1c1147",
    icons: [
      { src: "/pwa-icon/192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/pwa-icon/512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/pwa-icon/512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
