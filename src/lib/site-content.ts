import { tx } from "@/lib/i18n/translate";
import { INSTAGRAM_HANDLE } from "@/lib/site";

// Ana sayfadaki "Eğitmenle tanış" ve "Öğrenciler ne diyor?" bölümlerinin içeriği.
// Metinleri buradan değiştirebilirsiniz.

export const INSTRUCTOR = {
  name: "Ediz Sevinçler",
  role: tx("Ardemy Academy eğitmeni"),
  bio: tx("Ardemy Academy'yi işleten eğitmen. Rusça ve İngilizce öğrenmek isteyenler için birebir ders takibini ve bu platformu yürütür; sorularınızı doğrudan ona yazabilirsiniz."),
  // Fotoğraf eklemek için dosyayı public klasörüne koyun (ör. public/ediz.jpg)
  // ve burayı "/ediz.jpg" yapın. Boşsa baş harfler gösterilir.
  photo: null as string | null,
  instagram: INSTAGRAM_HANDLE,
};

// Gerçek öğrenci yorumları: {quote: "Yorum metni", name: "Ad S.", detail: "Rusça öğrencisi"}.
// Liste boşsa "Öğrenciler ne diyor?" bölümü hiç gösterilmez. Yalnızca yorumu
// yapan kişinin izniyle eklenmiş gerçek yorumlar yazılmalıdır.
export type Testimonial = { quote: string; name: string; detail?: string };
export const TESTIMONIALS: Testimonial[] = [];
