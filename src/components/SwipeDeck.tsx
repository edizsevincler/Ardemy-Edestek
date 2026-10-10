"use client";

import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import { recordCardReview } from "@/lib/cards-actions";
import { Celebration } from "@/components/Celebration";
import { useT } from "@/lib/i18n/client";
import type { DeckCard } from "@/lib/cards";

// Tarayıcının seslendirmesiyle (Web Speech API) kelimeyi okur; o dilde ses
// yüklüyse onu seçer, yoksa tarayıcı varsayılanı kullanır.
const noopSubscribe = () => () => {};

function speakWord(text: string, language: "EN" | "RU") {
  const synth = window.speechSynthesis;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = language === "RU" ? "ru-RU" : "en-US";
  const prefix = language === "RU" ? "ru" : "en";
  const voice = synth.getVoices().find((v) => v.lang.toLowerCase().startsWith(prefix));
  if (voice) utterance.voice = voice;
  utterance.rate = 0.9;
  synth.speak(utterance);
}

const THRESHOLD = 100; // bu kadar piksel kaydırılınca karar verilir

// Kaydırmalı kelime kartları: sağa = biliyorum, sola = tekrar, dokun = çevir.
// Düğmeler ve klavye okları da aynı işi yapar.
export function SwipeDeck({
  cards,
  language,
  canReload = true,
}: {
  cards: DeckCard[];
  language: "EN" | "RU";
  canReload?: boolean;
}) {
  const t = useT();
  const [round, setRound] = useState<DeckCard[]>(cards);
  const [index, setIndex] = useState(0);
  const [known, setKnown] = useState<DeckCard[]>([]);
  const [again, setAgain] = useState<DeckCard[]>([]);
  const [flipped, setFlipped] = useState(false);
  const [reverse, setReverse] = useState(false);
  const [dx, setDx] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [leaving, setLeaving] = useState<"known" | "again" | null>(null);
  const startX = useRef(0);
  const moved = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Aynı kart iki kez işlenmesin (pointerup + pointercancel birlikte gelebilir).
  const busy = useRef(false);
  const isDragging = useRef(false);
  // Seslendirme yalnızca destekleyen tarayıcılarda gösterilir (sunucuda bilinmez).
  const canSpeak = useSyncExternalStore(
    noopSubscribe,
    () => "speechSynthesis" in window,
    () => false
  );
  useEffect(() => {
    if (!canSpeak) return;
    window.speechSynthesis.getVoices(); // bazı tarayıcılar sesleri ilk çağrıda yükler
    return () => window.speechSynthesis.cancel();
  }, [canSpeak]);

  const done = index >= round.length;
  const card = round[index];

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current);
  }, []);

  const commit = useCallback(
    (verdict: "known" | "again") => {
      if (busy.current || !card) return;
      busy.current = true;
      setLeaving(verdict);
      void recordCardReview(card.id, verdict === "known");
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      timer.current = setTimeout(() => {
        if (verdict === "known") setKnown((list) => [...list, card]);
        else setAgain((list) => [...list, card]);
        setIndex((i) => i + 1);
        setFlipped(false);
        setDx(0);
        setLeaving(null);
        busy.current = false;
      }, reduce ? 0 : 230);
    },
    [card]
  );

  // Klavye: → biliyorum, ← tekrar, boşluk/yukarı/aşağı çevir
  useEffect(() => {
    if (done) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLElement && ["INPUT", "SELECT", "TEXTAREA"].includes(event.target.tagName)) return;
      if (event.key === "ArrowRight") commit("known");
      else if (event.key === "ArrowLeft") commit("again");
      else if (event.key === " " || event.key === "ArrowUp" || event.key === "ArrowDown") {
        event.preventDefault();
        setFlipped((f) => !f);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [done, commit]);

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    if (busy.current) return;
    startX.current = event.clientX;
    moved.current = false;
    isDragging.current = true;
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  }
  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (!dragging) return;
    const delta = event.clientX - startX.current;
    if (Math.abs(delta) > 6) moved.current = true;
    setDx(delta);
  }
  function onPointerUp() {
    if (!isDragging.current) return;
    isDragging.current = false;
    setDragging(false);
    if (dx > THRESHOLD) commit("known");
    else if (dx < -THRESHOLD) commit("again");
    else {
      setDx(0);
      if (!moved.current) setFlipped((f) => !f); // kısa dokunuş = çevir
    }
  }

  function restart(next: DeckCard[]) {
    setRound(next);
    setIndex(0);
    setKnown([]);
    setAgain([]);
    setFlipped(false);
    setDx(0);
  }

  if (done) {
    const total = known.length + again.length;
    return (
      <div className="space-y-4 rounded-2xl border border-brand-100 bg-white p-6 text-center shadow-sm">
        {total > 0 && known.length / total >= 0.8 && <Celebration count={36} />}
        <p className="text-2xl font-semibold text-brand-950">{t("Deste bitti! 🎉")}</p>
        <p className="text-slate-600">
          <span className="font-semibold text-green-600">{t("{n} biliyorum", { n: known.length })}</span>
          {" · "}
          <span className="font-semibold text-red-500">{t("{n} tekrar", { n: again.length })}</span>
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          {again.length > 0 && (
            <button
              type="button"
              onClick={() => restart(again)}
              className="rounded-lg bg-gradient-to-r from-gold-500 to-gold-400 px-5 py-2.5 text-sm font-semibold text-brand-950 shadow-sm transition-all duration-200 hover:scale-[1.03] active:scale-95"
            >
              {t("Tekrar edilecekleri çalış ({n})", { n: again.length })}
            </button>
          )}
          {canReload && (
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-lg border border-brand-200 bg-white px-5 py-2.5 text-sm font-medium text-brand-700 hover:bg-brand-50"
            >
              {t("Yeni deste")}
            </button>
          )}
        </div>
        {!canReload && <p className="text-xs text-slate-500">{t("Yarın yeni kelimeler gelecek.")}</p>}
      </div>
    );
  }

  const next = round[index + 1];
  const front = reverse ? card.back : card.front;
  const back = reverse ? card.front : card.back;
  const tilt = dx / 18;
  const transform =
    leaving === "known"
      ? "translateX(130vw) rotate(25deg)"
      : leaving === "again"
        ? "translateX(-130vw) rotate(-25deg)"
        : `translateX(${dx}px) rotate(${tilt}deg)`;
  const knownOpacity = Math.min(Math.max(dx / THRESHOLD, 0), 1);
  const againOpacity = Math.min(Math.max(-dx / THRESHOLD, 0), 1);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-slate-600">
          {index + 1} / {round.length}
        </span>
        <label className="flex cursor-pointer items-center gap-2 text-slate-600">
          <input
            type="checkbox"
            checked={reverse}
            onChange={(e) => {
              setReverse(e.target.checked);
              setFlipped(false);
            }}
            className="h-4 w-4 accent-brand-600"
          />
          {t("Yabancı dil önde")}
        </label>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-brand-100">
        <div
          className="h-full rounded-full bg-gradient-to-r from-gold-500 to-gold-400 transition-all duration-300"
          style={{ width: `${(index / round.length) * 100}%` }}
        />
      </div>

      <div className="relative mx-auto h-[24rem] w-full max-w-sm select-none">
        {next && (
          <div
            aria-hidden
            className="absolute inset-0 scale-95 rounded-3xl border border-brand-200 bg-brand-50 opacity-80"
            style={{ transform: "translateY(10px) scale(0.95)" }}
          />
        )}

        <div
          key={card.id}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className="absolute inset-0 cursor-grab touch-pan-y active:cursor-grabbing"
          style={{
            transform,
            transition: dragging ? "none" : "transform 0.23s ease-out",
            willChange: dragging ? "transform" : "auto",
          }}
        >
          <div
            className="relative h-full w-full transition-transform duration-300 [transform-style:preserve-3d]"
            style={{ transform: flipped ? "rotateY(180deg)" : "none" }}
          >
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-3xl border border-brand-200 bg-white p-6 text-center shadow-xl [backface-visibility:hidden]">
              <p className="break-words text-3xl font-semibold capitalize text-brand-950 sm:text-4xl">{front}</p>
              <p className="absolute bottom-5 text-xs text-slate-400">{t("Dokun: çevir")}</p>
            </div>
            <div
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-3xl border border-gold-300 bg-gradient-to-br from-gold-50 to-white p-6 text-center shadow-xl [backface-visibility:hidden]"
              style={{ transform: "rotateY(180deg)" }}
            >
              <p className="break-words text-3xl font-semibold text-brand-950 sm:text-4xl">{back}</p>
              <p className="absolute bottom-5 text-xs text-slate-400">{t("Dokun: çevir")}</p>
            </div>
          </div>

          {canSpeak && (
            <button
              type="button"
              aria-label={t("Sesli oku")}
              title={t("Sesli oku")}
              onPointerDown={(event) => event.stopPropagation()}
              onPointerUp={(event) => event.stopPropagation()}
              onClick={(event) => {
                event.stopPropagation();
                speakWord(card.speak, language);
              }}
              className="absolute bottom-4 right-4 flex h-11 w-11 items-center justify-center rounded-full border border-brand-200 bg-white text-brand-600 shadow-sm transition-colors hover:bg-brand-50 active:scale-95"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d="M11 5 6 9H3v6h3l5 4V5z" />
                <path d="M15.5 8.5a5 5 0 0 1 0 7" />
                <path d="M18.5 5.5a9 9 0 0 1 0 13" />
              </svg>
            </button>
          )}

          <span
            className="pointer-events-none absolute left-5 top-5 -rotate-12 rounded-lg border-4 border-green-500 px-3 py-1 text-xl font-bold text-green-500"
            style={{ opacity: knownOpacity }}
          >
            {t("BİLİYORUM")}
          </span>
          <span
            className="pointer-events-none absolute right-5 top-5 rotate-12 rounded-lg border-4 border-red-500 px-3 py-1 text-xl font-bold text-red-500"
            style={{ opacity: againOpacity }}
          >
            {t("TEKRAR")}
          </span>
        </div>
      </div>

      <div className="mx-auto flex max-w-sm items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => commit("again")}
          className="flex h-14 flex-1 items-center justify-center rounded-2xl border-2 border-red-300 bg-white text-base font-semibold text-red-500 transition-colors hover:bg-red-50 active:scale-95"
        >
          ✗ {t("Tekrar")}
        </button>
        <button
          type="button"
          onClick={() => setFlipped((f) => !f)}
          className="flex h-14 w-20 items-center justify-center rounded-2xl border border-slate-300 bg-white text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50 active:scale-95"
        >
          ↻ {t("Çevir")}
        </button>
        <button
          type="button"
          onClick={() => commit("known")}
          className="flex h-14 flex-1 items-center justify-center rounded-2xl border-2 border-green-400 bg-white text-base font-semibold text-green-600 transition-colors hover:bg-green-50 active:scale-95"
        >
          ✓ {t("Biliyorum")}
        </button>
      </div>
      <p className="text-center text-xs text-slate-500">{t("Sağa kaydır: biliyorum, sola kaydır: tekrar")}</p>
    </div>
  );
}
