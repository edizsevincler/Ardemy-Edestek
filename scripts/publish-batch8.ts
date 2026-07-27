import { publishLessons, prisma } from "./publish-lessons";

const BASE = "C:\\Users\\Kemal_Tahir\\Desktop\\ARDEMY PROJEM\\scratchpad\\english-lessons\\";

async function main() {
  await publishLessons([
    {
      pdfPath: BASE + "28_Seyahat_ve_Bilgi.pdf",
      fileName: "28 Seyahat ve Bilgi Alışverişi Kalıpları.pdf",
      title: "18 Seyahat ve Bilgi Alışverişi Kalıpları",
      subject: "İngilizce - Kelime ve Kalıplar",
      creditCost: 2,
    },
  ]);
  await publishLessons([
    {
      pdfPath: BASE + "29_Duygular_ve_Kisilik.pdf",
      fileName: "29 Duygular ve Kişilik Sıfatları.pdf",
      title: "19 Duygular ve Kişilik Sıfatları",
      subject: "İngilizce - Kelime ve Kalıplar",
      creditCost: 2,
    },
  ]);
  await publishLessons([
    {
      pdfPath: BASE + "30_Future_Perfect.pdf",
      fileName: "30 Gelecek Zamandaki Geçmiş (Future Perfect).pdf",
      title: "11 Gelecek Zamandaki Geçmiş (Future Perfect)",
      subject: "İngilizce - Zamanlar",
      creditCost: 2,
    },
  ]);
  await publishLessons([
    {
      pdfPath: BASE + "31_Is_ve_Gunluk_Yasam.pdf",
      fileName: "31 İş ve Günlük Yaşam Kalıpları.pdf",
      title: "20 İş ve Günlük Yaşam Kalıpları",
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
