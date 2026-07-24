"use client";

// Web'de ekran görüntüsünü teknik olarak engellemek mümkün değil — bu
// yüzden gerçek koruma yerine caydırıcı bir filigran kullanıyoruz: içerik
// paylaşılırsa hangi hesaptan sızdığı görünür olur. Kopyalama/sağ tık da
// ayrıca zorlaştırılıyor (tam engel değil, sürtünme).
export function ProtectedContent({
  watermarkText,
  children,
}: {
  watermarkText: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="relative select-none"
      onContextMenu={(e) => e.preventDefault()}
      onCopy={(e) => e.preventDefault()}
    >
      <div className="pointer-events-none absolute inset-0 z-10 flex flex-wrap content-start gap-x-10 gap-y-16 overflow-hidden opacity-[0.08]">
        {Array.from({ length: 30 }).map((_, i) => (
          <span
            key={i}
            className="-rotate-12 whitespace-nowrap text-sm font-medium text-brand-950"
          >
            {watermarkText}
          </span>
        ))}
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}
