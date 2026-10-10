"use client";

// Sayfa boyanmadan önce kayıtlı/cihaz temasını uygular (yanıp sönmeyi önler).
// Betik yalnızca sunucuda çizilir: tarayıcıda yeniden çizilirse React 19
// "script tag while rendering" uyarısı verir ve betik zaten çalışmıştır.
const THEME_SCRIPT = `try{var t=localStorage.getItem("ardemy_theme");if(t==="dark"||(t!=="light"&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}`;

export function ThemeScript() {
  if (typeof window !== "undefined") return null;
  return <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />;
}
