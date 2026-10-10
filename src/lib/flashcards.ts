import mammoth from "mammoth";
import { prisma } from "@/lib/prisma";

// Ders notlarındaki "TÜRKÇE = YABANCI" satırlarından kelime kartı üretir.

export type CardPair = { front: string; back: string };

// "İ" burada yok: Türkçe klavyeyle yazılan İngilizce kelimelerde de çıkıyor (DECİDE).
const TURKISH_LETTERS = /[çğıöşüÇĞÖŞÜ]/;
// Türkçe mastar eki (-mek/-mak) olan taraf Türkçedir.
const INFINITIVE = /(mek|mak)$/i;
// Almanca/İngilizce tanımlayıcıyla başlayan taraf yabancıdır ("die Tische", "to run").
const FOREIGN_START = /^(die|der|das|ein|eine|to|the)\s/i;
const looksTurkish = (text: string) => TURKISH_LETTERS.test(text) || INFINITIVE.test(text);

function clean(text: string) {
  return text
    .replace(/[“”"]/g, "")
    .replace(/\s+/g, " ")
    .replace(/^[\s\-–•*]+/, "")
    .replace(/[\s\-–•*:;,/]+$/, "")
    .trim();
}

// Yalnızca büyük harfle yazılmış mı? (Notlar çoğunlukla BÜYÜK HARFLE yazılmış.)
function isAllCaps(text: string) {
  const letters = text.replace(/[^\p{L}]/gu, "");
  return letters.length > 0 && letters === letters.toLocaleUpperCase("tr");
}

// Büyük harfli yazılmış metni küçültür; Türkçe taraf Türkçe kurallarıyla (I→ı),
// yabancı taraf İngilizce kurallarıyla (Türkçe klavyedeki "İ" → "i", I → i).
function lowerTurkish(text: string) {
  return isAllCaps(text) ? text.toLocaleLowerCase("tr") : text;
}
function lowerForeign(text: string) {
  if (isAllCaps(text)) return text.replace(/İ/g, "i").toLowerCase();
  // "İnvitation" gibi İngilizce kelimede kalan "İ" harfini düzelt.
  if (!TURKISH_LETTERS.test(text) && text.includes("İ")) {
    return text.replace(/İ/g, (_m, offset: number) => (offset === 0 ? "I" : "i"));
  }
  return text;
}

// Hangi taraf Türkçe? Türkçeye özgü harfi olan taraf Türkçedir; ikisi de büyük
// harfliyse soldaki Türkçe kabul edilir; küçük/karışık harfli satırlar
// çoğunlukla "yabancı = Türkçe" yazılmıştır.
function orient(a: string, b: string): [string, string] {
  const aF = FOREIGN_START.test(a);
  const bF = FOREIGN_START.test(b);
  if (aF && !bF) return [b, a];
  if (bF && !aF) return [a, b];
  const aTr = looksTurkish(a);
  const bTr = looksTurkish(b);
  if (aTr && !bTr) return [a, b];
  if (bTr && !aTr) return [b, a];
  if (isAllCaps(a) && isAllCaps(b)) return [a, b];
  return [b, a];
}

// Aynı çiftin iki yönü (a=b ve b=a) aynı anahtarı üretir.
export function pairKey(front: string, back: string) {
  return [front, back].map((t) => t.toLocaleLowerCase("tr")).sort().join("|");
}

const tooLong = (text: string) => text.length > 60 || text.split(" ").length > 5;
const looksLikeSentence = (text: string) => /[.!?](?!\.)/.test(text.replace(/\.\.\.|…/g, ""));

export function parsePairs(lines: string[]): CardPair[] {
  const seen = new Set<string>();
  const out: CardPair[] = [];
  for (const raw of lines) {
    if (raw.length > 130 || raw.split("=").length !== 2) continue;
    const [left, right] = raw.split("=").map(clean);
    if (!left || !right || tooLong(left) || tooLong(right)) continue;
    if (looksLikeSentence(left) || looksLikeSentence(right)) continue;
    if (/^\d+$/.test(left) || /^\d+$/.test(right)) continue;
    const [turkish, foreign] = orient(left, right);
    const front = lowerTurkish(turkish);
    const back = lowerForeign(foreign);
    if (front.toLocaleLowerCase("tr") === back.toLocaleLowerCase("tr")) continue;
    const key = pairKey(front, back);
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({ front, back });
  }
  return out;
}

export async function extractPairsFromDocx(buffer: Buffer): Promise<CardPair[]> {
  const { value } = await mammoth.extractRawText({ buffer });
  return parsePairs(value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean));
}

// Kartları öğrencilere ekler (aynı kart zaten varsa atlanır). Eklenen sayıyı döndürür.
export async function addCardsForStudents(
  userIds: string[],
  pairs: CardPair[],
  sourceTitle: string | null
): Promise<number> {
  if (pairs.length === 0 || userIds.length === 0) return 0;
  let added = 0;
  for (const userId of userIds) {
    // Aynı kartın ters yönü zaten varsa tekrar eklenmez.
    const existing = await prisma.flashCard.findMany({ where: { userId }, select: { front: true, back: true } });
    const known = new Set(existing.map((c) => pairKey(c.front, c.back)));
    const fresh = pairs.filter((pair) => !known.has(pairKey(pair.front, pair.back)));
    if (fresh.length === 0) continue;
    const result = await prisma.flashCard.createMany({
      data: fresh.map((pair) => ({ userId, front: pair.front, back: pair.back, sourceTitle })),
      skipDuplicates: true,
    });
    added += result.count;
  }
  return added;
}
