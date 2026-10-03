// Haftalık sosyal medya paketi için ek kartlar (mini ders slaytı, kelime kareleri,
// genel bilgi/hikâye kartları). Kurallar cards.tsx ile aynı: satori yalnızca
// flexbox ve satır içi stil destekler; birden fazla çocuklu her kutu flex olmalı.
// Yazı tipinde ok (→) ve tik (✓) glifleri yok; metinde kullanılmamalı.

import { Frame } from "@/lib/og/cards";

type Size = { width: number; height: number };

const GOLD = "#e8c25a";

export function InfoCard({
  size,
  logo,
  emoji,
  title,
  lines = [],
  footer,
  titleSize = 84,
}: {
  size: Size;
  logo: string;
  emoji: string;
  title: string;
  lines?: string[];
  footer: string;
  titleSize?: number;
}) {
  return (
    <Frame size={size} logo={logo} footer={footer}>
      <div style={{ display: "flex", fontSize: 150 }}>{emoji}</div>
      <div
        style={{
          display: "flex",
          fontSize: titleSize,
          fontWeight: 700,
          lineHeight: 1.15,
          marginTop: 28,
          textAlign: "center",
        }}
      >
        {title}
      </div>
      {lines.map((line, i) => (
        <div
          key={i}
          style={{
            display: "flex",
            fontSize: 46,
            color: i === 0 ? GOLD : "#e7e1fa",
            fontWeight: i === 0 ? 700 : 400,
            marginTop: i === 0 ? 36 : 14,
            textAlign: "center",
          }}
        >
          {line}
        </div>
      ))}
    </Frame>
  );
}

export function LessonSlide({
  size,
  logo,
  step,
  total,
  heading,
  rows,
  note,
  footer = "Kaydet ve sonra tekrar bak",
  chip,
}: {
  size: Size;
  logo: string;
  step: number;
  total: number;
  heading: string;
  rows: { left: string; right: string }[];
  note?: string;
  footer?: string;
  chip?: string;
}) {
  return (
    <Frame size={size} logo={logo} footer={footer}>
      <div
        style={{
          display: "flex",
          padding: "8px 28px",
          borderRadius: 9999,
          background: "rgba(232,194,90,0.2)",
          color: GOLD,
          fontSize: 30,
          fontWeight: 700,
        }}
      >
        {chip ?? `Mini Ders · ${step}/${total}`}
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 58,
          fontWeight: 700,
          lineHeight: 1.15,
          textAlign: "center",
          marginTop: 22,
          marginBottom: 22,
        }}
      >
        {heading}
      </div>
      <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
        {rows.map((row, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
              marginTop: i === 0 ? 0 : 12,
              padding: "14px 28px",
              borderRadius: 20,
              background: "rgba(255,255,255,0.12)",
              border: "3px solid rgba(255,255,255,0.18)",
            }}
          >
            <div
              style={{
                display: "flex",
                fontSize: 40,
                fontWeight: 700,
                color: GOLD,
                maxWidth: "52%",
              }}
            >
              {row.left}
            </div>
            <div
              style={{
                display: "flex",
                fontSize: 36,
                color: "#e7e1fa",
                textAlign: "right",
                maxWidth: "46%",
                justifyContent: "flex-end",
              }}
            >
              {row.right}
            </div>
          </div>
        ))}
      </div>
      {note && (
        <div
          style={{
            display: "flex",
            fontSize: 34,
            color: "#cfc4f2",
            marginTop: 22,
            textAlign: "center",
          }}
        >
          {note}
        </div>
      )}
    </Frame>
  );
}

export function WordFrame({
  size,
  logo,
  topic,
  word,
  meaning,
  reading,
  note,
}: {
  size: Size;
  logo: string;
  topic: string;
  word: string;
  meaning: string;
  reading?: string;
  note?: string;
}) {
  return (
    <Frame size={size} logo={logo} footer="Kaydet ve tekrar et">
      <div
        style={{
          display: "flex",
          padding: "10px 30px",
          borderRadius: 9999,
          background: "rgba(232,194,90,0.2)",
          color: GOLD,
          fontSize: 34,
          fontWeight: 700,
        }}
      >
        {topic}
      </div>
      <div
        style={{
          display: "flex",
          fontSize: word.length > 12 ? 84 : 118,
          fontWeight: 700,
          marginTop: 70,
          textAlign: "center",
        }}
      >
        {word}
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 80,
          fontWeight: 700,
          color: GOLD,
          marginTop: 40,
        }}
      >
        {meaning}
      </div>
      {note && (
        <div style={{ display: "flex", fontSize: 48, color: "#fca5a5", fontWeight: 700, marginTop: 34, textAlign: "center" }}>
          {note}
        </div>
      )}
      {reading && (
        <div style={{ display: "flex", fontSize: 46, color: "#cfc4f2", marginTop: 28 }}>
          {`okunuşu: ${reading}`}
        </div>
      )}
    </Frame>
  );
}
