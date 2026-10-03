"use client";

import { useEffect, useState } from "react";

const COLORS = ["#d4a72c", "#e8c25a", "#5c3fce", "#7c62db", "#f97316", "#22c55e", "#38bdf8"];

// Konfeti yağmuru: ekrana eklendiği anda başlar, birkaç saniye sonra kendini
// kaldırır. Parçaların konumu indeksten türetilir (render sırasında rastgele
// değer kullanılmaz); hareketi azaltma tercihi olanlarda CSS parçaları gizler.
export function Celebration({ count = 36 }: { count?: number }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    try {
      navigator.vibrate?.([18, 40, 18]);
    } catch {
      // titreşim desteklenmiyorsa sorun değil
    }
    const timer = setTimeout(() => setVisible(false), 3200);
    return () => clearTimeout(timer);
  }, []);

  if (!visible) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-50 overflow-hidden"
    >
      {Array.from({ length: count }, (_, i) => {
        const spread = Math.sin(i * 12.9898) * 43758.5453;
        const frac = spread - Math.floor(spread);
        const left = ((i * 37 + frac * 20) % 100).toFixed(1);
        const drift = Math.round((frac - 0.5) * 220);
        const spin = Math.round(240 + frac * 560) * (i % 2 === 0 ? 1 : -1);
        const duration = (1.9 + frac * 1.1).toFixed(2);
        const delay = ((i % 9) * 0.07).toFixed(2);
        return (
          <span
            key={i}
            className="confetti-piece"
            style={
              {
                left: `${left}%`,
                backgroundColor: COLORS[i % COLORS.length],
                "--confetti-x": `${drift}px`,
                "--confetti-r": `${spin}deg`,
                "--confetti-d": `${duration}s`,
                "--confetti-delay": `${delay}s`,
              } as React.CSSProperties
            }
          />
        );
      })}
    </div>
  );
}
