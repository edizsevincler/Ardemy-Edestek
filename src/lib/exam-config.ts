// Deneme sınavı sabitleri ve ortak tipler (istemciden de import edilebilir).

export const EXAM_PRICE_CREDITS = 2;
export const EXAM_SIZE = 20;
export const EXAM_MINUTES = 20;
import { tx } from "@/lib/i18n/translate";

// Deneme sorularının konu adları (veritabanında Türkçe); gösterimde t() ile çevrilir.
export const EXAM_TOPICS = [
  tx("Zamanlar"),
  tx("Dil Bilgisi"),
  tx("Kelime"),
  tx("Edat ve Kalıplar"),
  tx("Padejler"),
  tx("Fiil ve Dil Bilgisi"),
  tx("Kalıplar ve Sayılar"),
];

export const EXAM_LANGUAGES = ["İngilizce", "Rusça"] as const;
// Başlayıp bitirilmeyen bir sınavın "devam et" olarak açık kalacağı süre.
export const EXAM_RESUME_HOURS = 2;

export type ExamLetter = "A" | "B" | "C" | "D";

export type ExamRunnerQuestion = {
  id: string;
  prompt: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
};

export type ExamReviewItem = {
  id: string;
  topic: string;
  prompt: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  selected: ExamLetter | null;
  correct: ExamLetter;
  explanation: string | null;
};

export type ExamResultData = {
  attemptId: string;
  score: number;
  total: number;
  language: string;
  review: ExamReviewItem[];
};
