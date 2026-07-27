import { publishLessons, prisma } from "./publish-lessons";

const BASE = "C:\\Users\\Kemal_Tahir\\Desktop\\ARDEMY PROJEM\\scratchpad\\english-lessons\\";

async function main() {
  await publishLessons([
    {
      pdfPath: BASE + "17_Istek_Kaliplari.pdf",
      fileName: "17 İstek Kalıpları.pdf",
      title: "11 \"-Meni / -Manı\" İstek Kalıpları",
      subject: "İngilizce - Kelime ve Kalıplar",
      creditCost: 2,
    },
  ]);
  await publishLessons([
    {
      pdfPath: BASE + "18_Present_Perfect_Continuous.pdf",
      fileName: "18 Yakın Geçmişin Şimdiki Hali (Present Perfect Continuous).pdf",
      title: "7 Yakın Geçmişin Şimdiki Hali (Present Perfect Continuous)",
      subject: "İngilizce - Zamanlar",
      creditCost: 2,
    },
  ]);
  await publishLessons([
    {
      pdfPath: BASE + "19_Miktar_Belirtecleri.pdf",
      fileName: "19 Miktar Belirteçleri ve Farklı Kalıplar.pdf",
      title: "12 Miktar Belirteçleri ve Farklı Kalıplar",
      subject: "İngilizce - Kelime ve Kalıplar",
      creditCost: 2,
    },
  ]);
  await publishLessons([
    {
      pdfPath: BASE + "20_That_ve_Soru_Baglaclari.pdf",
      fileName: "20 That ve Soru Kelimesi Bağlaçları.pdf",
      title: "13 That ve Soru Kelimesi Bağlaçları",
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
