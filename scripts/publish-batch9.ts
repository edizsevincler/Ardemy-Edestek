import { publishLessons, prisma } from "./publish-lessons";

const BASE = "C:\\Users\\Kemal_Tahir\\Desktop\\ARDEMY PROJEM\\scratchpad\\english-lessons\\";

async function main() {
  await publishLessons([
    {
      pdfPath: BASE + "32_Passive_Voice.pdf",
      fileName: "32 Edilgen Çatı (Passive Voice).pdf",
      title: "12 Edilgen Çatı (Passive Voice)",
      subject: "İngilizce - Zamanlar",
      creditCost: 2,
    },
  ]);
  await publishLessons([
    {
      pdfPath: BASE + "33_As_Kaliplari.pdf",
      fileName: "33 As Kalıpları ve Memnuniyet İfadeleri.pdf",
      title: "21 As Kalıpları ve Memnuniyet İfadeleri",
      subject: "İngilizce - Kelime ve Kalıplar",
      creditCost: 2,
    },
  ]);
  await publishLessons([
    {
      pdfPath: BASE + "34_Karma_Kaliplar_1.pdf",
      fileName: "34 Karma Kalıplar 1.pdf",
      title: "22 Karma Kalıplar - 1",
      subject: "İngilizce - Kelime ve Kalıplar",
      creditCost: 2,
    },
  ]);
  await publishLessons([
    {
      pdfPath: BASE + "35_Karma_Kaliplar_2.pdf",
      fileName: "35 Karma Kalıplar 2.pdf",
      title: "23 Karma Kalıplar - 2",
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
