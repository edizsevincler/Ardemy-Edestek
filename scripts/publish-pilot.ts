import { publishLessons, prisma } from "./publish-lessons";

async function main() {
  await publishLessons([
    {
      pdfPath:
        "C:\\Users\\Kemal_Tahir\\Desktop\\ARDEMY PROJEM\\scratchpad\\english-lessons\\01_Genis_Zaman.pdf",
      fileName: "01 Geniş Zaman (Present Simple).pdf",
      title: "1 Geniş Zaman (Present Simple)",
      subject: "İngilizce - Zamanlar",
      creditCost: 0,
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
