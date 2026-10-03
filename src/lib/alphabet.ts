// Rusça (Kiril) alfabe verisi: /rusca-alfabe sayfası, poster görseli ve
// "7 günlük alfabe challenge" paketi için ortak kaynak.

export type RussianLetter = {
  upper: string;
  lower: string;
  sound: string; // Türkçe okunuş
  example: string; // örnek kelime (Rusça)
  meaning: string; // örnek kelimenin Türkçesi
  day: number; // 7 günlük challenge'daki günü
  note?: string;
};

// Rusça alfabe sırasıyla.
export const RUSSIAN_ALPHABET: RussianLetter[] = [
  { upper: "А", lower: "а", sound: "a", example: "арбуз", meaning: "karpuz", day: 1 },
  { upper: "Б", lower: "б", sound: "b", example: "банан", meaning: "muz", day: 3 },
  { upper: "В", lower: "в", sound: "v", example: "виза", meaning: "vize", day: 2, note: "Latin B'ye benzer ama V okunur." },
  { upper: "Г", lower: "г", sound: "g", example: "газета", meaning: "gazete", day: 3 },
  { upper: "Д", lower: "д", sound: "d", example: "душ", meaning: "duş", day: 3 },
  { upper: "Е", lower: "е", sound: "ye", example: "лето", meaning: "yaz", day: 2, note: "Genelde \"ye\" okunur (lyeto)." },
  { upper: "Ё", lower: "ё", sound: "yo", example: "ёлка", meaning: "yılbaşı ağacı", day: 7 },
  { upper: "Ж", lower: "ж", sound: "j", example: "жена", meaning: "eş, hanım", day: 6, note: "Türkçedeki j gibi (jandarma)." },
  { upper: "З", lower: "з", sound: "z", example: "зима", meaning: "kış", day: 4 },
  { upper: "И", lower: "и", sound: "i", example: "игра", meaning: "oyun", day: 4 },
  { upper: "Й", lower: "й", sound: "y", example: "май", meaning: "mayıs", day: 4, note: "Kısa i; ünlünün sonunda y gibi." },
  { upper: "К", lower: "к", sound: "k", example: "кот", meaning: "kedi", day: 1 },
  { upper: "Л", lower: "л", sound: "l", example: "лампа", meaning: "lamba", day: 4 },
  { upper: "М", lower: "м", sound: "m", example: "мама", meaning: "anne", day: 1 },
  { upper: "Н", lower: "н", sound: "n", example: "нос", meaning: "burun", day: 2, note: "Latin H'ye benzer ama N okunur." },
  { upper: "О", lower: "о", sound: "o", example: "дом", meaning: "ev", day: 1, note: "Vurgusuzken a'ya yakın okunur." },
  { upper: "П", lower: "п", sound: "p", example: "парк", meaning: "park", day: 4 },
  { upper: "Р", lower: "р", sound: "r", example: "рука", meaning: "el", day: 2, note: "Latin P'ye benzer ama R okunur (titrek r)." },
  { upper: "С", lower: "с", sound: "s", example: "сок", meaning: "meyve suyu", day: 2, note: "Latin C'ye benzer ama S okunur." },
  { upper: "Т", lower: "т", sound: "t", example: "торт", meaning: "pasta", day: 1 },
  { upper: "У", lower: "у", sound: "u", example: "утро", meaning: "sabah", day: 3, note: "Latin Y'ye benzer ama U okunur." },
  { upper: "Ф", lower: "ф", sound: "f", example: "фото", meaning: "fotoğraf", day: 5 },
  { upper: "Х", lower: "х", sound: "h", example: "хлеб", meaning: "ekmek", day: 3, note: "Latin X'e benzer ama boğazdan h okunur." },
  { upper: "Ц", lower: "ц", sound: "ts", example: "цирк", meaning: "sirk", day: 5 },
  { upper: "Ч", lower: "ч", sound: "ç", example: "чай", meaning: "çay", day: 5 },
  { upper: "Ш", lower: "ш", sound: "ş", example: "школа", meaning: "okul", day: 5 },
  { upper: "Щ", lower: "щ", sound: "şç", example: "борщ", meaning: "borş çorbası", day: 5 },
  { upper: "Ъ", lower: "ъ", sound: "-", example: "объект", meaning: "nesne", day: 7, note: "Sert işaret: okunmaz, iki sesi ayırır." },
  { upper: "Ы", lower: "ы", sound: "ı", example: "сын", meaning: "oğul", day: 6 },
  { upper: "Ь", lower: "ь", sound: "-", example: "день", meaning: "gün", day: 7, note: "Yumuşak işaret: okunmaz, önceki ünsüzü yumuşatır." },
  { upper: "Э", lower: "э", sound: "e", example: "эхо", meaning: "yankı", day: 6 },
  { upper: "Ю", lower: "ю", sound: "yu", example: "юг", meaning: "güney", day: 6 },
  { upper: "Я", lower: "я", sound: "ya", example: "яблоко", meaning: "elma", day: 6 },
];

export function lettersForDay(day: number) {
  return RUSSIAN_ALPHABET.filter((l) => l.day === day);
}

// İngilizce konuşanlar için okunuş (Latin transliterasyon), örnek kelimenin
// İngilizcesi ve not. Türkçe dışındaki diller bu veriyi kullanır.
const EN_VIEW: Record<string, { sound: string; meaning: string; note?: string }> = {
  "А": { sound: "a", meaning: "watermelon" },
  "Б": { sound: "b", meaning: "banana" },
  "В": { sound: "v", meaning: "visa", note: "Looks like Latin B but sounds like V." },
  "Г": { sound: "g", meaning: "newspaper" },
  "Д": { sound: "d", meaning: "shower" },
  "Е": { sound: "ye", meaning: "summer", note: "Usually sounds like \"ye\" (lyeto)." },
  "Ё": { sound: "yo", meaning: "Christmas tree" },
  "Ж": { sound: "zh", meaning: "wife", note: "Like the s in \"measure\"." },
  "З": { sound: "z", meaning: "winter" },
  "И": { sound: "ee", meaning: "game", note: "Like \"ee\" in \"see\"." },
  "Й": { sound: "y", meaning: "May", note: "A short i; sounds like y after a vowel." },
  "К": { sound: "k", meaning: "cat" },
  "Л": { sound: "l", meaning: "lamp" },
  "М": { sound: "m", meaning: "mom" },
  "Н": { sound: "n", meaning: "nose", note: "Looks like Latin H but sounds like N." },
  "О": { sound: "o", meaning: "house", note: "Sounds close to \"a\" when unstressed." },
  "П": { sound: "p", meaning: "park" },
  "Р": { sound: "r", meaning: "hand", note: "Looks like Latin P but sounds like a rolled R." },
  "С": { sound: "s", meaning: "juice", note: "Looks like Latin C but sounds like S." },
  "Т": { sound: "t", meaning: "cake" },
  "У": { sound: "oo", meaning: "morning", note: "Looks like Latin Y but sounds like \"oo\"." },
  "Ф": { sound: "f", meaning: "photo" },
  "Х": { sound: "kh", meaning: "bread", note: "Looks like Latin X but sounds like a throaty \"kh\"." },
  "Ц": { sound: "ts", meaning: "circus" },
  "Ч": { sound: "ch", meaning: "tea" },
  "Ш": { sound: "sh", meaning: "school" },
  "Щ": { sound: "shch", meaning: "borscht" },
  "Ъ": { sound: "-", meaning: "object", note: "Hard sign: silent, separates two sounds." },
  "Ы": { sound: "ih", meaning: "son", note: "Like the i in \"bit\", but pronounced further back." },
  "Ь": { sound: "-", meaning: "day", note: "Soft sign: silent, softens the previous consonant." },
  "Э": { sound: "e", meaning: "echo", note: "Like \"e\" in \"met\"." },
  "Ю": { sound: "yu", meaning: "south" },
  "Я": { sound: "ya", meaning: "apple" },
};

export type LetterView = {
  upper: string;
  lower: string;
  sound: string;
  example: string;
  meaning: string;
  note?: string;
};

// Arayüz diline göre harf listesi: Türkçe için Türkçe okunuş/anlam, diğerleri için İngilizce.
export function alphabetFor(locale: string): LetterView[] {
  if (locale === "tr") return RUSSIAN_ALPHABET;
  return RUSSIAN_ALPHABET.map((l) => ({
    upper: l.upper,
    lower: l.lower,
    example: l.example,
    ...EN_VIEW[l.upper],
  }));
}
