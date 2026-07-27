import { publishLessons, prisma } from "./publish-lessons";

const BASE = "C:\\Users\\Kemal_Tahir\\Desktop\\ARDEMY PROJEM\\scratchpad\\english-lessons\\";

async function main() {
  await publishLessons([
    {
      pdfPath: BASE + "21_Yer_Edatlari_ve_Hava.pdf",
      fileName: "21 Yer Edatları There Is-Are ve Hava Durumu.pdf",
      title: "14 Yer Edatları, There Is-Are ve Hava Durumu",
      subject: "İngilizce - Kelime ve Kalıplar",
      creditCost: 2,
    },
  ]);
  await publishLessons([
    {
      pdfPath: BASE + "22_Sira_Sayilari_ve_Zaman.pdf",
      fileName: "22 Sıra Sayıları ve Zaman İfadeleri.pdf",
      title: "15 Sıra Sayıları ve Zaman İfadeleri",
      subject: "İngilizce - Kelime ve Kalıplar",
      creditCost: 2,
    },
  ]);
  await publishLessons([
    {
      pdfPath: BASE + "23_Past_Perfect.pdf",
      fileName: "23 Geçmişten Önceki Geçmiş Zaman (Past Perfect).pdf",
      title: "8 Geçmişten Önceki Geçmiş Zaman (Past Perfect)",
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
