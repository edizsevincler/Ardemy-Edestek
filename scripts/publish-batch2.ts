import { publishLessons, prisma } from "./publish-lessons";

const BASE = "C:\\Users\\Kemal_Tahir\\Desktop\\ARDEMY PROJEM\\scratchpad\\english-lessons\\";

async function main() {
  await publishLessons([
    {
      pdfPath: BASE + "05_Am_Is_Are.pdf",
      fileName: "05 Am Is Are ve Duygu Sıfatları.pdf",
      title: "4 Am - Is - Are ve Duygu Sıfatları",
      subject: "İngilizce - Kelime ve Kalıplar",
      creditCost: 2,
    },
  ]);
  await publishLessons([
    {
      pdfPath: BASE + "06_Simdiki_Zaman.pdf",
      fileName: "06 Şimdiki Zaman (Present Continuous).pdf",
      title: "3 Şimdiki Zaman (Present Continuous)",
      subject: "İngilizce - Zamanlar",
      creditCost: 2,
    },
  ]);
  await publishLessons([
    {
      pdfPath: BASE + "07_Gunluk_Fiiller_ve_Edatlar.pdf",
      fileName: "07 Günlük Fiiller ve Edatlar.pdf",
      title: "5 Günlük Fiiller ve Edatlar",
      subject: "İngilizce - Kelime ve Kalıplar",
      creditCost: 2,
    },
  ]);
  await publishLessons([
    {
      pdfPath: BASE + "08_Sorular_ve_Zamirler.pdf",
      fileName: "08 Sorular ve Dönüşlü Zamirler.pdf",
      title: "6 Sorular ve Dönüşlü Zamirler",
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
