// Her sayfa geçişinde yeniden oluşur; içerik yumuşakça belirir.
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="animate-fade-in">{children}</div>;
}
