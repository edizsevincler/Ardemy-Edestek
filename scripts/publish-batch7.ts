import { publishLessons, prisma } from "./publish-lessons";

const BASE = "C:\\Users\\Kemal_Tahir\\Desktop\\ARDEMY PROJEM\\scratchpad\\english-lessons\\";

async function main() {
  await publishLessons([
    {
      pdfPath: BASE + "24_Past_Perfect_Continuous.pdf",
      fileName: "24 Geçmişten Önceki Geçmişin Şimdiki Hali (Past Perfect Continuous).pdf",
      title: "9 Geçmişten Önceki Geçmişin Şimdiki Hali (Past Perfect Continuous)",
      subject: "İngilizce - Zamanlar",
      creditCost: 2,
    },
  ]);
  await publishLessons([
    {
      pdfPath: BASE + "25_Before_After_Kaliplari.pdf",
      fileName: "25 Before After ve Sorumluluk Kalıpları.pdf",
      title: "16 Before - After ve Sorumluluk Kalıpları",
      subject: "İngilizce - Kelime ve Kalıplar",
      creditCost: 2,
    },
  ]);
  await publishLessons([
    {
      pdfPath: BASE + "26_Whenever_Whatever_Wherever.pdf",
      fileName: "26 Whenever Whatever Wherever ve Belirsizlik Zamirleri.pdf",
      title: "17 Whenever - Whatever - Wherever ve Belirsizlik Zamirleri",
      subject: "İngilizce - Kelime ve Kalıplar",
      creditCost: 2,
    },
  ]);
  await publishLessons([
    {
      pdfPath: BASE + "27_Future_Continuous.pdf",
      fileName: "27 Gelecek Zamanın Şimdiki Hali (Future Continuous).pdf",
      title: "10 Gelecek Zamanın Şimdiki Hali (Future Continuous)",
      subject: "İngilizce - Zamanlar",
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
