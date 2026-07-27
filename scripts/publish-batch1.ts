import { publishLessons, prisma } from "./publish-lessons";

const BASE = "C:\\Users\\Kemal_Tahir\\Desktop\\ARDEMY PROJEM\\scratchpad\\english-lessons\\";

async function main() {
  // Sıra önemli: her subject için önce daha erken (numarası küçük) dersler eklenmeli
  // çünkü nextCreatedAt() en eski mevcut kaydın 1sn öncesini kullanıyor.
  await publishLessons([
    {
      pdfPath: BASE + "02_Temel_Fiiller.pdf",
      fileName: "02 Temel Fiiller ve Sıklık Zarfları.pdf",
      title: "2 Temel Fiiller ve Sıklık Zarfları",
      subject: "İngilizce - Kelime ve Kalıplar",
      creditCost: 0,
    },
  ]);
  await publishLessons([
    {
      pdfPath: BASE + "03_Gelecek_Zaman.pdf",
      fileName: "03 Gelecek Zaman (Future Simple).pdf",
      title: "2 Gelecek Zaman (Future Simple - Will)",
      subject: "İngilizce - Zamanlar",
      creditCost: 2,
    },
  ]);
  await publishLessons([
    {
      pdfPath: BASE + "04_Modallar_ve_Ihtiyac.pdf",
      fileName: "04 Modallar ve İhtiyaç Kalıpları.pdf",
      title: "3 Modallar ve İhtiyaç Kalıpları",
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
