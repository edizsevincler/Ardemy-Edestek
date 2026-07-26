export function FlagIcon({
  language,
  className = "h-8 w-11",
}: {
  language: string;
  className?: string;
}) {
  if (language === "Rusça") {
    return (
      <svg
        viewBox="0 0 3 2"
        className={`${className} rounded shadow-sm ring-1 ring-black/10`}
      >
        <rect width="3" height="2" fill="#fff" />
        <rect width="3" height="1.334" y="0.666" fill="#0039A6" />
        <rect width="3" height="0.666" y="1.334" fill="#D52B1E" />
      </svg>
    );
  }

  if (language === "İngilizce") {
    return (
      <svg
        viewBox="0 0 60 36"
        className={`${className} rounded shadow-sm ring-1 ring-black/10`}
      >
        <rect width="60" height="36" fill="#00247d" />
        <path d="M0,0 60,36 M60,0 0,36" stroke="#fff" strokeWidth="6" />
        <path d="M0,0 60,36 M60,0 0,36" stroke="#cf142b" strokeWidth="2" />
        <path d="M30,0 30,36 M0,18 60,18" stroke="#fff" strokeWidth="10" />
        <path d="M30,0 30,36 M0,18 60,18" stroke="#cf142b" strokeWidth="6" />
      </svg>
    );
  }

  return (
    <span
      className={`${className} flex items-center justify-center rounded bg-slate-100 text-lg`}
    >
      🌐
    </span>
  );
}
