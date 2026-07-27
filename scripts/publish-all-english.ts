// Kullanım: DATABASE_URL=... BLOB_READ_WRITE_TOKEN=... npx tsx scripts/publish-all-english.ts
//
// scratchpad/english-lessons içindeki 40 PDF'i (artık hepsi 5 sayfa) production'daki
// var olan Question kayıtlarıyla title+subject eşleştirip PDF'lerini günceller.

import { updateLessonPdf } from "./publish-lessons";

const DIR = "C:\\Users\\Kemal_Tahir\\Desktop\\ARDEMY PROJEM\\scratchpad\\english-lessons";
const ZAMANLAR = "İngilizce - Zamanlar";
const KELIME = "İngilizce - Kelime ve Kalıplar";

const lessons = [
  { fileBase: "01_Genis_Zaman", title: "1 Geniş Zaman (Present Simple)", subject: ZAMANLAR },
  { fileBase: "02_Temel_Fiiller", title: "1 Temel Fiiller ve Sıklık Zarfları", subject: KELIME },
  { fileBase: "03_Gelecek_Zaman", title: "2 Gelecek Zaman (Future Simple - Will)", subject: ZAMANLAR },
  { fileBase: "04_Modallar_ve_Ihtiyac", title: "2 Modallar ve İhtiyaç Kalıpları", subject: KELIME },
  { fileBase: "05_Am_Is_Are", title: "3 Am - Is - Are ve Duygu Sıfatları", subject: KELIME },
  { fileBase: "06_Simdiki_Zaman", title: "3 Şimdiki Zaman (Present Continuous)", subject: ZAMANLAR },
  { fileBase: "07_Gunluk_Fiiller_ve_Edatlar", title: "4 Günlük Fiiller ve Edatlar", subject: KELIME },
  { fileBase: "08_Sorular_ve_Zamirler", title: "5 Sorular ve Dönüşlü Zamirler", subject: KELIME },
  { fileBase: "09_Dili_Gecmis_Zaman", title: "4 Di'li Geçmiş Zaman (Past Simple)", subject: ZAMANLAR },
  { fileBase: "10_Was_Were", title: "6 Was - Were ve Farklı Sıfatlar", subject: KELIME },
  { fileBase: "11_Emir_Kipi_ve_Renkler", title: "7 Emir Kipi, Renkler ve Aile Üyeleri", subject: KELIME },
  { fileBase: "12_Gecmis_Zamanin_Simdiki_Hali", title: "5 Geçmiş Zamanın Şimdiki Hali (Past Continuous)", subject: ZAMANLAR },
  { fileBase: "13_Karsilastirma_Kaliplari", title: "8 Karşılaştırma Kalıpları (Comparative - Superlative)", subject: KELIME },
  { fileBase: "14_Aylar_ve_Gunluk_Kaliplar", title: "9 Aylar ve Günlük Kalıplar", subject: KELIME },
  { fileBase: "15_Present_Perfect", title: "6 Yakın Geçmiş Zaman (Present Perfect)", subject: ZAMANLAR },
  { fileBase: "16_Could_Kaliplari", title: "10 Could Kalıpları ve Anlaşma-Memnuniyet İfadeleri", subject: KELIME },
  { fileBase: "17_Istek_Kaliplari", title: "11 \"-Meni / -Manı\" İstek Kalıpları", subject: KELIME },
  { fileBase: "18_Present_Perfect_Continuous", title: "7 Yakın Geçmişin Şimdiki Hali (Present Perfect Continuous)", subject: ZAMANLAR },
  { fileBase: "19_Miktar_Belirtecleri", title: "12 Miktar Belirteçleri ve Farklı Kalıplar", subject: KELIME },
  { fileBase: "20_That_ve_Soru_Baglaclari", title: "13 That ve Soru Kelimesi Bağlaçları", subject: KELIME },
  { fileBase: "21_Yer_Edatlari_ve_Hava", title: "14 Yer Edatları, There Is-Are ve Hava Durumu", subject: KELIME },
  { fileBase: "22_Sira_Sayilari_ve_Zaman", title: "15 Sıra Sayıları ve Zaman İfadeleri", subject: KELIME },
  { fileBase: "23_Past_Perfect", title: "8 Geçmişten Önceki Geçmiş Zaman (Past Perfect)", subject: ZAMANLAR },
  { fileBase: "24_Past_Perfect_Continuous", title: "9 Geçmişten Önceki Geçmişin Şimdiki Hali (Past Perfect Continuous)", subject: ZAMANLAR },
  { fileBase: "25_Before_After_Kaliplari", title: "16 Before - After ve Sorumluluk Kalıpları", subject: KELIME },
  { fileBase: "26_Whenever_Whatever_Wherever", title: "17 Whenever - Whatever - Wherever ve Belirsizlik Zamirleri", subject: KELIME },
  { fileBase: "27_Future_Continuous", title: "10 Gelecek Zamanın Şimdiki Hali (Future Continuous)", subject: ZAMANLAR },
  { fileBase: "28_Seyahat_ve_Bilgi", title: "18 Seyahat ve Bilgi Alışverişi Kalıpları", subject: KELIME },
  { fileBase: "29_Duygular_ve_Kisilik", title: "19 Duygular ve Kişilik Sıfatları", subject: KELIME },
  { fileBase: "30_Future_Perfect", title: "11 Gelecek Zamandaki Geçmiş (Future Perfect)", subject: ZAMANLAR },
  { fileBase: "31_Is_ve_Gunluk_Yasam", title: "20 İş ve Günlük Yaşam Kalıpları", subject: KELIME },
  { fileBase: "32_Passive_Voice", title: "12 Edilgen Çatı (Passive Voice)", subject: ZAMANLAR },
  { fileBase: "33_As_Kaliplari", title: "21 As Kalıpları ve Memnuniyet İfadeleri", subject: KELIME },
  { fileBase: "34_Karma_Kaliplar_1", title: "22 Karma Kalıplar - 1", subject: KELIME },
  { fileBase: "35_Karma_Kaliplar_2", title: "23 Karma Kalıplar - 2", subject: KELIME },
  { fileBase: "36_Karma_Kaliplar_3", title: "24 Karma Kalıplar - 3", subject: KELIME },
  { fileBase: "37_Karma_Kaliplar_4", title: "25 Karma Kalıplar - 4", subject: KELIME },
  { fileBase: "38_Karma_Kaliplar_5", title: "26 Karma Kalıplar - 5", subject: KELIME },
  { fileBase: "39_Karma_Kaliplar_6", title: "27 Karma Kalıplar - 6", subject: KELIME },
  { fileBase: "40_Future_Perfect_Continuous", title: "13 Gelecek Zamandaki Geçmişin Şimdiki Hali (Future Perfect Continuous)", subject: ZAMANLAR },
].map((l) => ({
  pdfPath: `${DIR}\\${l.fileBase}.pdf`,
  fileName: `${l.fileBase}.pdf`,
  title: l.title,
  subject: l.subject,
  creditCost: 0,
}));

async function main() {
  console.log(`Toplam ${lessons.length} ders güncellenecek.`);
  for (const lesson of lessons) {
    await updateLessonPdf(lesson);
  }
}

main();
