import { publishLessons, prisma } from "./publish-lessons";

const BASE = "C:\\Users\\Kemal_Tahir\\Desktop\\ARDEMY PROJEM\\scratchpad\\english-lessons\\";

async function main() {
  await publishLessons([
    {
      pdfPath: BASE + "36_Karma_Kaliplar_3.pdf",
      fileName: "36 Karma Kalıplar 3.pdf",
      title: "24 Karma Kalıplar - 3",
      subject: "İngilizce - Kelime ve Kalıplar",
      creditCost: 2,
    },
  ]);
  await publishLessons([
    {
      pdfPath: BASE + "37_Karma_Kaliplar_4.pdf",
      fileName: "37 Karma Kalıplar 4.pdf",
      title: "25 Karma Kalıplar - 4",
      subject: "İngilizce - Kelime ve Kalıplar",
      creditCost: 2,
    },
  ]);
  await publishLessons([
    {
      pdfPath: BASE + "38_Karma_Kaliplar_5.pdf",
      fileName: "38 Karma Kalıplar 5.pdf",
      title: "26 Karma Kalıplar - 5",
      subject: "İngilizce - Kelime ve Kalıplar",
      creditCost: 2,
    },
  ]);
  await publishLessons([
    {
      pdfPath: BASE + "39_Karma_Kaliplar_6.pdf",
      fileName: "39 Karma Kalıplar 6.pdf",
      title: "27 Karma Kalıplar - 6",
      subject: "İngilizce - Kelime ve Kalıplar",
      creditCost: 2,
    },
  ]);
  await publishLessons([
    {
      pdfPath: BASE + "40_Future_Perfect_Continuous.pdf",
      fileName: "40 Gelecek Zamandaki Geçmişin Şimdiki Hali (Future Perfect Continuous).pdf",
      title: "13 Gelecek Zamandaki Geçmişin Şimdiki Hali (Future Perfect Continuous)",
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
