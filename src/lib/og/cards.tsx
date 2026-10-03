/* eslint-disable @next/next/no-img-element */
// next/og (satori) kartları: yalnızca flexbox ve satır içi stil desteklenir;
// birden fazla çocuğu olan her kutu display:flex olmalıdır.

import type { ReactNode } from "react";
import { INSTAGRAM_HANDLE, SITE_HOST } from "@/lib/site";
import { OG_FONT_FAMILY } from "@/lib/og/assets";

const BG = "linear-gradient(160deg, #1c1147 0%, #2f2178 55%, #4b32b3 100%)";
const GOLD = "#e8c25a";

type Size = { width: number; height: number };

export function Frame({
  size,
  logo,
  children,
  footer,
}: {
  size: Size;
  logo: string;
  children: ReactNode;
  footer: string;
}) {
  const story = size.height > size.width;
  return (
    <div
      style={{
        width: size.width,
        height: size.height,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: BG,
        color: "white",
        fontFamily: OG_FONT_FAMILY,
        padding: story ? "120px 80px" : "72px 80px",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: -160,
          left: -160,
          width: 520,
          height: 520,
          borderRadius: 9999,
          background: "rgba(232,194,90,0.16)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: -200,
          right: -120,
          width: 560,
          height: 560,
          borderRadius: 9999,
          background: "rgba(124,98,219,0.30)",
        }}
      />

      <div style={{ display: "flex", alignItems: "center" }}>
        <img
          src={logo}
          width={84}
          height={84}
          alt=""
          style={{ borderRadius: 20, background: "white" }}
        />
        <div
          style={{
            display: "flex",
            marginLeft: 24,
            fontSize: 36,
            fontWeight: 700,
            letterSpacing: 4,
          }}
        >
          ARDEMY ACADEMY
        </div>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          flexGrow: 1,
          textAlign: "center",
        }}
      >
        {children}
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <div style={{ display: "flex", fontSize: 36, fontWeight: 700, color: GOLD }}>
          {footer}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 8,
            fontSize: 30,
            color: "#cfc4f2",
          }}
        >
          {`${INSTAGRAM_HANDLE}  ·  ${SITE_HOST}`}
        </div>
      </div>
    </div>
  );
}

function verdictEmoji(percent: number) {
  if (percent >= 90) return "🏆";
  if (percent >= 70) return "🎉";
  if (percent >= 50) return "💪";
  return "📚";
}

export function ExamCard({
  size,
  logo,
  firstName,
  language,
  score,
  total,
}: {
  size: Size;
  logo: string;
  firstName: string;
  language: string;
  score: number;
  total: number;
}) {
  const percent = Math.round((score / Math.max(total, 1)) * 100);
  return (
    <Frame size={size} logo={logo} footer="Sen de dene">
      <div style={{ display: "flex", fontSize: 150 }}>{verdictEmoji(percent)}</div>
      <div style={{ display: "flex", fontSize: 48, color: "#cfc4f2", marginTop: 16 }}>
        {firstName}
      </div>
      <div style={{ display: "flex", fontSize: 56, fontWeight: 700, marginTop: 8 }}>
        {language} Deneme Sınavı
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 260,
          fontWeight: 700,
          color: GOLD,
          lineHeight: 1.05,
          marginTop: 24,
        }}
      >
        {score}/{total}
      </div>
      <div style={{ display: "flex", fontSize: 52, color: "#e7e1fa" }}>
        %{percent} doğru
      </div>
    </Frame>
  );
}

export function StreakCard({
  size,
  logo,
  firstName,
  streak,
}: {
  size: Size;
  logo: string;
  firstName: string;
  streak: number;
}) {
  return (
    <Frame size={size} logo={logo} footer="Sen de seri yap">
      <div style={{ display: "flex", fontSize: 220 }}>🔥</div>
      <div
        style={{
          display: "flex",
          fontSize: 250,
          fontWeight: 700,
          color: GOLD,
          lineHeight: 1.05,
        }}
      >
        {streak}
      </div>
      <div style={{ display: "flex", fontSize: 72, fontWeight: 700 }}>
        günlük çalışma serisi
      </div>
      <div style={{ display: "flex", fontSize: 44, color: "#cfc4f2", marginTop: 20 }}>
        {firstName} her gün çalışıyor 💪
      </div>
    </Frame>
  );
}

export function BadgeCard({
  size,
  logo,
  firstName,
  emoji,
  title,
  description,
}: {
  size: Size;
  logo: string;
  firstName: string;
  emoji: string;
  title: string;
  description: string;
}) {
  return (
    <Frame size={size} logo={logo} footer="Sen de rozet kazan">
      <div style={{ display: "flex", fontSize: 44, color: "#cfc4f2" }}>
        {firstName} yeni bir rozet kazandı!
      </div>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: 380,
          height: 380,
          borderRadius: 9999,
          background: "rgba(232,194,90,0.18)",
          border: "6px solid #e8c25a",
          marginTop: 40,
          fontSize: 220,
        }}
      >
        {emoji}
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 96,
          fontWeight: 700,
          color: GOLD,
          marginTop: 40,
        }}
      >
        {title}
      </div>
      <div style={{ display: "flex", fontSize: 46, color: "#e7e1fa", marginTop: 12 }}>
        {description}
      </div>
    </Frame>
  );
}

const LETTERS = ["A", "B", "C", "D"] as const;

export function QuestionCard({
  size,
  logo,
  language,
  prompt,
  options,
  correct,
  reveal,
  label,
}: {
  size: Size;
  logo: string;
  language: string;
  prompt: string;
  options: string[];
  correct: number;
  reveal: boolean;
  label?: string;
}) {
  const story = size.height > size.width;
  const promptSize = prompt.length > 70 ? 56 : prompt.length > 40 ? 68 : 80;
  return (
    <Frame
      size={size}
      logo={logo}
      footer={
        reveal
          ? "Doğru bildin mi? Sen de dene"
          : "Cevabını yorumlara yaz 👇"
      }
    >
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
        {reveal
          ? `${label ?? `Günün ${language} Sorusu`} — Cevap`
          : (label ?? `Günün ${language} Sorusu`)}
      </div>
      <div
        style={{
          display: "flex",
          fontSize: promptSize,
          fontWeight: 700,
          lineHeight: 1.2,
          marginTop: story ? 56 : 32,
          marginBottom: story ? 56 : 32,
        }}
      >
        {prompt}
      </div>
      <div style={{ display: "flex", flexDirection: "column", width: "100%" }}>
        {options.map((text, i) => {
          const isCorrect = reveal && i === correct;
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                width: "100%",
                marginTop: i === 0 ? 0 : story ? 24 : 16,
                padding: story ? "26px 32px" : "18px 28px",
                borderRadius: 24,
                background: isCorrect ? "#16a34a" : "rgba(255,255,255,0.12)",
                border: isCorrect
                  ? "3px solid #86efac"
                  : "3px solid rgba(255,255,255,0.18)",
                opacity: reveal && !isCorrect ? 0.55 : 1,
                fontSize: 44,
                fontWeight: 700,
                textAlign: "left",
              }}
            >
              <div
                style={{
                  display: "flex",
                  color: isCorrect ? "white" : GOLD,
                  width: 64,
                }}
              >
                {LETTERS[i]}
              </div>
              <div style={{ display: "flex", flexGrow: 1 }}>{text}</div>
              {isCorrect && <div style={{ display: "flex" }}>✅</div>}
            </div>
          );
        })}
      </div>
    </Frame>
  );
}
