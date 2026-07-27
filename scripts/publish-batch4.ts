import { publishLessons, prisma } from "./publish-lessons";

const BASE = "C:\\Users\\Kemal_Tahir\\Desktop\\ARDEMY PROJEM\\scratchpad\\english-lessons\\";

async function main() {
  await publishLessons([
    {
      pdfPath: BASE + "13_Karsilastirma_Kaliplari.pdf",
      fileName: "13 Karşılaştırma Kalıpları.pdf",
      title: "8 Karşılaştırma Kalıpları (Comparative - Superlative)",
      subject: "İngilizce - Kelime ve Kalıplar",
      creditCost: 2,
    },
  ]);
  await publishLessons([
    {
      pdfPath: BASE + "14_Aylar_ve_Gunluk_Kaliplar.pdf",
      fileName: "14 Aylar ve Günlük Kalıplar.pdf",
      title: "9 Aylar ve Günlük Kalıplar",
      subject: "İngilizce - Kelime ve Kalıplar",
      creditCost: 2,
    },
  ]);
  await publishLessons([
    {
      pdfPath: BASE + "15_Present_Perfect.pdf",
      fileName: "15 Yakın Geçmiş Zaman (Present Perfect).pdf",
      title: "6 Yakın Geçmiş Zaman (Present Perfect)",
      subject: "İngilizce - Zamanlar",
      creditCost: 2,
    },
  ]);
  await publishLessons([
    {
      pdfPath: BASE + "16_Could_Kaliplari.pdf",
      fileName: "16 Could Kalıpları.pdf",
      title: "10 Could Kalıpları ve Anlaşma-Memnuniyet İfadeleri",
      subject: "İngilizce - Kelime ve Kalıplar",
      creditCost: 2,
    },
  ]);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
