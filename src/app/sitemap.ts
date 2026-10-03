import type { MetadataRoute } from "next";
import { FREE_TEST_LANGUAGES } from "@/lib/free-test";
import { SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    { path: "", priority: 1 },
    { path: "/dene", priority: 0.9 },
    ...Object.keys(FREE_TEST_LANGUAGES).map((slug) => ({
      path: `/dene/${slug}`,
      priority: 0.9,
    })),
    { path: "/rusca-alfabe", priority: 0.9 },
    { path: "/register", priority: 0.7 },
    { path: "/gizlilik-politikasi", priority: 0.2 },
    { path: "/mesafeli-satis-sozlesmesi", priority: 0.2 },
  ];
  return pages.map(({ path, priority }) => ({
    url: `${SITE_URL}${path}`,
    changeFrequency: "weekly",
    priority,
  }));
}
