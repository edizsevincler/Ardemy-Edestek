// Sayfa yüklenirken gösterilen gri iskelet (loading.tsx dosyaları kullanır).
// Renkler slate ölçeğinden geldiği için koyu modda da otomatik uyum sağlar.

function Block({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-slate-200 ${className}`} />;
}

export function PageSkeleton() {
  return (
    <div className="space-y-6" role="status" aria-busy="true" aria-live="polite">
      <Block className="h-8 w-48" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="space-y-3 rounded-xl border border-brand-100 bg-white p-5 shadow-sm"
          >
            <Block className="h-4 w-24" />
            <Block className="h-8 w-16" />
          </div>
        ))}
      </div>
      <div className="space-y-3 rounded-xl border border-brand-100 bg-white p-5 shadow-sm">
        <Block className="h-5 w-40" />
        <Block className="h-4 w-full" />
        <Block className="h-4 w-5/6" />
        <div className="space-y-2 pt-2">
          {[0, 1, 2, 3].map((i) => (
            <Block key={i} className="h-11 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}
