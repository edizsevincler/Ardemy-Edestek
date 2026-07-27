import { publishLessons, prisma } from "./publish-lessons";

const BASE = "C:\\Users\\Kemal_Tahir\\Desktop\\ARDEMY PROJEM\\scratchpad\\english-lessons\\";

async function main() {
  await publishLessons([
    {
      pdfPath: BASE + "09_Dili_Gecmis_Zaman.pdf",
      fileName: "09 Di'li Geçmiş Zaman (Past Simple).pdf",
      title: "4 Di'li Geçmiş Zaman (Past Simple)",
      subject: "İngilizce - Zamanlar",
      creditCost: 2,
    },
  ]);
  await publishLessons([
    {
      pdfPath: BASE + "10_Was_Were.pdf",
      fileName: "10 Was Were ve Farklı Sıfatlar.pdf",
      title: "6 Was - Were ve Farklı Sıfatlar",
      subject: "İngilizce - Kelime ve Kalıplar",
      creditCost: 2,
    },
  ]);
  await publishLessons([
    {
      pdfPath: BASE + "11_Emir_Kipi_ve_Renkler.pdf",
      fileName: "11 Emir Kipi Renkler ve Aile Üyeleri.pdf",
      title: "7 Emir Kipi, Renkler ve Aile Üyeleri",
      subject: "İngilizce - Kelime ve Kalıplar",
      creditCost: 2,
    },
  ]);
  await publishLessons([
    {
      pdfPath: BASE + "12_Gecmis_Zamanin_Simdiki_Hali.pdf",
      fileName: "12 Geçmiş Zamanın Şimdiki Hali (Past Continuous).pdf",
      title: "5 Geçmiş Zamanın Şimdiki Hali (Past Continuous)",
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
