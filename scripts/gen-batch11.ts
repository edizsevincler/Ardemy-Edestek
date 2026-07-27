import { writeLessonDocx, LessonDef } from "./lib/lesson-docx";

const OUT_DIR = "C:\\Users\\Kemal_Tahir\\Desktop\\ARDEMY PROJEM\\scratchpad\\english-lessons";

const lessons: LessonDef[] = [
  {
    fileBase: "40_Future_Perfect_Continuous",
    title: "GELECEK ZAMANDAKİ GEÇMİŞİN ŞİMDİKİ HALİ (FUTURE PERFECT CONTINUOUS)",
    blocks: [
      { type: "rule", text: "Bu, İngilizcedeki 12 tense'in sonuncusudur. Gelecekte belirli bir zamana kadar bir süredir devam ediyor olacak eylemleri anlatmak için kullanılır." },
      { type: "rule", text: "Yapı: Özne + WILL HAVE BEEN + Fiil-ING. WILL HAVE BEEN bütün öznelerde aynı kalır." },
      { type: "pattern", text: "ÖZNE + WILL HAVE BEEN + V-ing" },
      { type: "example", en: "By next month, I will have been working here for five years.", tr: "Gelecek aya kadar burada beş yıldır çalışıyor olacağım." },
      { type: "example", en: "She will have been studying for six hours by the time the exam starts.", tr: "Sınav başladığında o altı saattir ders çalışıyor olacak." },
      { type: "example", en: "By next year, they will have been living in this house for a decade.", tr: "Gelecek yıla kadar bu evde on yıldır yaşıyor olacaklar." },
      { type: "rule", text: "Olumsuz yapı: Özne + WON'T HAVE BEEN + Fiil-ING." },
      { type: "example", en: "They won't have been waiting long when we arrive.", tr: "Biz vardığımızda onlar uzun süredir beklemiyor olacaklar." },
      { type: "example", en: "He won't have been driving for more than two hours.", tr: "İki saatten fazla süredir araba kullanıyor olmayacak." },
      { type: "rule", text: "Soru yapısı: WILL + Özne + HAVE BEEN + Fiil-ING?" },
      { type: "example", en: "How long will you have been living here by next year?", tr: "Gelecek yıla kadar burada ne kadardır yaşıyor olacaksın?" },
      { type: "example", en: "Will she have been teaching for ten years by June?", tr: "Haziran'a kadar on yıldır öğretmenlik yapıyor olacak mı?" },
      { type: "rule", text: "Bu tense genellikle BY + zaman ifadesi ve FOR + süre birlikte kullanılır; gelecekteki bir noktaya kadar geçen süreyi vurgular." },
      { type: "example", en: "By the end of this year, we will have been living in this city for ten years.", tr: "Bu yılın sonuna kadar bu şehirde on yıldır yaşıyor olacağız." },
      { type: "rule", text: "Bu tense günlük konuşmada çok sık kullanılmaz, ama akademik ve yazılı İngilizcede süreklilik ve süre vurgusu gereken durumlarda karşımıza çıkar." },
      { type: "example", en: "By the time he retires, he will have been working for this company for thirty years.", tr: "O emekli olduğunda, bu şirket için otuz yıldır çalışıyor olacak." },
      { type: "rule", text: "İngilizcedeki 12 tense'i özetleyelim: Present Simple, Present Continuous, Present Perfect, Present Perfect Continuous, Past Simple, Past Continuous, Past Perfect, Past Perfect Continuous, Future Simple, Future Continuous, Future Perfect, Future Perfect Continuous." },
      { type: "rule", text: "Bu 12 tense'e ek olarak Edilgen Çatı (Passive Voice) her tense ile birlikte kullanılabilen ayrı bir yapıdır ve önceki derste detaylıca işlenmiştir." },
      { type: "rule", text: "Bu dersle birlikte İngilizcedeki bütün tense yapılarını tamamlamış olduk. Artık kelime ve kalıp derslerindeki örnek cümlelerin hangi tense ile kurulduğunu tanıyabilir, kendi cümlelerinizi bu yapılarla kurabilirsiniz." },
      { type: "rule", text: "12 tense'in kısa özet tablosu: Geniş Zaman (V1/V-s), Şimdiki Zaman (am/is/are + V-ing), Yakın Geçmiş (have/has + V3), Yakın Geçmişin Şimdiki Hali (have/has been + V-ing), Di'li Geçmiş (V2), Geçmiş Zamanın Şimdiki Hali (was/were + V-ing), Geçmişten Önceki Geçmiş (had + V3), Geçmişten Önceki Geçmişin Şimdiki Hali (had been + V-ing), Gelecek Zaman (will + V1), Gelecek Zamanın Şimdiki Hali (will be + V-ing), Gelecek Zamandaki Geçmiş (will have + V3), Gelecek Zamandaki Geçmişin Şimdiki Hali (will have been + V-ing)." },
      { type: "rule", text: "Her tense çiftinin (Present/Past/Future) kendi içinde aynı mantığı takip ettiği fark edilmelidir: Simple (temel eylem), Continuous (süreklilik), Perfect (tamamlanmışlık), Perfect Continuous (belirli bir noktaya kadar süreklilik)." },
      { type: "example", en: "I have been living here since 2018, and by next year I will have been living here for eight years.", tr: "2018'den beri burada yaşıyorum ve gelecek yıla kadar sekiz yıldır burada yaşıyor olacağım." },
      { type: "rule", text: "Bu 12 tense yapısı ile kelime ve kalıp derslerindeki yüzlerce örnek cümleyi artık daha bilinçli şekilde analiz edebilir, hangi zamanın neden kullanıldığını ayırt edebilirsiniz." },
      { type: "rule", text: "\"MOVE\" fiili üzerinden Future Perfect Continuous tam çekim tablosunu görelim." },
      { type: "pattern", text: "TAM ÇEKİM: MOVE (TAŞINMAK)" },
      { type: "example", en: "By next year, I will have been moving between offices for six months.", tr: "Gelecek yıla kadar altı aydır ofisler arasında taşınıyor olacağım." },
      { type: "example", en: "By December, they will have been living in temporary housing for a year.", tr: "Aralık'a kadar bir yıldır geçici konutta yaşıyor olacaklar." },
      { type: "rule", text: "Olumsuz ve soru çekimlerini görelim." },
      { type: "example", en: "By then, she won't have been working here for very long.", tr: "O zamana kadar burada çok uzun süredir çalışıyor olmayacak." },
      { type: "example", en: "Will you have been studying for over a decade by the time you finish your PhD?", tr: "Doktoranı bitirdiğinde on yıldan fazla süredir ders çalışıyor olacak mısın?" },
      { type: "rule", text: "Future Perfect Continuous, bir sürecin gelecekte belirli bir noktaya kadar ne kadar sürmüş olacağını vurgulamak için HOW LONG sorusuyla sıkça kullanılır." },
      { type: "example", en: "How long will you have been working here by the time you retire?", tr: "Emekli olduğunda burada ne kadar süredir çalışmış olacaksın?" },
      { type: "rule", text: "Bu tense, Future Perfect'ten farklı olarak sonuca değil, sürece ve sürekliliğe odaklanır; ikisi arasındaki fark Present Perfect ile Present Perfect Continuous arasındaki farkla aynı mantığı taşır." },
      { type: "example", en: "By June, I will have written the book. (Future Perfect, sonuç) / By June, I will have been writing the book for a year. (Future Perfect Continuous, süreç)", tr: "Haziran'a kadar kitabı yazmış olacağım. / Haziran'a kadar kitabı bir yıldır yazıyor olacağım." },
      { type: "rule", text: "Sık yapılan bir hata, KNOW, BELIEVE, WANT gibi durum (stative) fiilleriyle bu tense'i kullanmaktır; bu fiillerle Future Perfect Simple tercih edilmelidir." },
      { type: "example", en: "By then, I will have known her for ten years. (DOĞRU) — NOT: I will have been knowing her.", tr: "O zamana kadar onu on yıldır tanıyor olacağım." },
      { type: "rule", text: "Son olarak bu dersteki ve kursun genelindeki en karmaşık tense'i pekiştiren bir kapanış cümlesi görelim." },
      { type: "example", en: "By the time this course ends, you will have been learning English tenses systematically for several months, and you will have built a solid foundation for real conversations.", tr: "Bu kurs bittiğinde, İngilizce zamanları sistematik olarak birkaç aydır öğreniyor olacaksınız ve gerçek konuşmalar için sağlam bir temel oluşturmuş olacaksınız." },
      { type: "rule", text: "Future Perfect Continuous, iş hayatında uzun vadeli projelerin süresini vurgulamak için de sıkça kullanılır." },
      { type: "example", en: "By the time the project is delivered, our team will have been working on it for over a year.", tr: "Proje teslim edildiğinde, ekibimiz bir yıldan fazla süredir üzerinde çalışıyor olacak." },
      { type: "example", en: "By next spring, the construction crew will have been building this bridge for three years.", tr: "Gelecek ilkbahara kadar, inşaat ekibi bu köprüyü üç yıldır inşa ediyor olacak." },
      { type: "rule", text: "Bu tense, bir alışkanlığın ya da sürecin gelecekte hâlâ devam ediyor olacağını, belirli bir zaman noktasına atıfla anlatır." },
      { type: "example", en: "By the time she's fifty, she will have been running her own business for twenty-five years.", tr: "Elli yaşına geldiğinde, kendi işini yirmi beş yıldır yönetiyor olacak." },
      { type: "rule", text: "Future Perfect Continuous'un olumsuz hâli, bir sürecin beklenen süre kadar devam etmemiş olacağını vurgular." },
      { type: "example", en: "By the deadline, we won't have been testing the software long enough to be fully confident.", tr: "Son teslim tarihine kadar, yazılımı tam güvenmek için yeterince uzun süre test etmiş olmayacağız." },
      { type: "rule", text: "Kursun bu son dersiyle birlikte, öğrenciler artık İngilizcedeki bütün zaman yapılarını tanımlayabilir, doğru bağlamda kullanabilir ve karmaşık cümleleri çözümleyebilir hâle gelmiş olmalıdır." },
      { type: "example", en: "Congratulations — by finishing this course, you will have completed a journey through all twelve English tenses, and you will have been building your grammar skills step by step the whole way.", tr: "Tebrikler — bu kursu bitirerek, İngilizcedeki on iki zamanın hepsinde bir yolculuğu tamamlamış olacaksınız ve bütün bu süreç boyunca dil bilginizi adım adım inşa ediyor olacaksınız." },
      { type: "rule", text: "Future Perfect Continuous'u pekiştirmek için birkaç soru-cevap alıştırması daha görelim." },
      { type: "example", en: "Will you have been living abroad for a long time by the time you come back? — Yes, by then I will have been living abroad for almost four years.", tr: "Geri döndüğünde uzun süredir yurt dışında mı yaşıyor olacaksın? — Evet, o zamana kadar neredeyse dört yıldır yurt dışında yaşıyor olacağım." },
      { type: "example", en: "How long will she have been teaching by the time she retires? — She will have been teaching for over thirty years.", tr: "Emekli olduğunda ne kadar süredir öğretmenlik yapmış olacak? — Otuz yıldan fazla süredir öğretmenlik yapmış olacak." },
      { type: "rule", text: "Bu tense'in gündelik hayatta kullanımı sınırlı olsa da, akademik yazılarda, iş raporlarında ve uzun vadeli planlama konuşmalarında karşımıza çıkabilir." },
      { type: "example", en: "By 2035, engineers will have been developing this technology for over two decades.", tr: "2035'e kadar, mühendisler bu teknolojiyi yirmi yıldan fazla süredir geliştiriyor olacak." },
      { type: "rule", text: "Kursu tamamlarken, 12 tense'in her birini ayrı ayrı ele aldığımızı ve her birinin kendine özgü bir işlevi olduğunu hatırlayalım: zamanı belirtmek, süreyi vurgulamak, sırayı netleştirmek ya da bir eylemin sonucunu göstermek." },
      { type: "example", en: "Whether you're talking about the past, present, or future, English gives you the tools to express exactly when and how something happens — and now, you will have been mastering all of them.", tr: "İster geçmişten, ister şimdiden, ister gelecekten bahsediyor olun, İngilizce size bir şeyin tam olarak ne zaman ve nasıl olduğunu ifade etmeniz için araçlar sunar — ve artık, hepsinde ustalaşıyor olacaksınız." },
      { type: "rule", text: "Son olarak, bütün kursu özetleyen bir tavsiye ile kapatalım: her tense'i tek başına ezberlemek yerine, örnek cümleler üzerinden bağlamıyla birlikte öğrenmek çok daha kalıcıdır." },
      { type: "example", en: "The more you practice using these tenses in real sentences, the more naturally they will come to you in conversation.", tr: "Bu zamanları gerçek cümlelerde kullanmayı ne kadar çok pratik yaparsanız, konuşmada o kadar doğal bir şekilde gelirler." },
      { type: "example", en: "By continuing to read, listen, and speak English regularly, you will have been reinforcing everything you've learned in this course long after it ends.", tr: "İngilizce okumaya, dinlemeye ve konuşmaya düzenli olarak devam ederek, bu kursta öğrendiğiniz her şeyi kurs bittikten çok sonra bile pekiştiriyor olacaksınız." },
      { type: "rule", text: "Kurstaki 40 dersin tamamını tamamladığınızda, İngilizcenin gramer yapısını A1 seviyesinden ileri seviyeye kadar sistemli bir şekilde görmüş olacaksınız: zamanlar, kalıplar, bağlaçlar ve günlük kullanım." },
      { type: "example", en: "Looking back, you will realize how far you've come since the first lesson on Present Simple.", tr: "Geriye baktığınızda, Present Simple ile ilgili ilk dersten bu yana ne kadar yol kat ettiğinizi fark edeceksiniz." },
      { type: "example", en: "Keep practicing, stay curious, and remember that language learning is a journey that never really ends.", tr: "Pratik yapmaya devam edin, meraklı kalın ve dil öğreniminin aslında hiç bitmeyen bir yolculuk olduğunu unutmayın." },
      { type: "rule", text: "Future Perfect Continuous ile ilgili son bir örnek grup daha görelim: bilim, teknoloji ve çevre konularında uzun vadeli süreçleri anlatırken bu tense sıkça tercih edilir." },
      { type: "example", en: "By 2040, farmers will have been using this irrigation method for nearly twenty years.", tr: "2040'a kadar çiftçiler bu sulama yöntemini neredeyse yirmi yıldır kullanıyor olacak." },
      { type: "example", en: "By the time the satellite completes its mission, it will have been orbiting the planet for a decade.", tr: "Uydu görevini tamamladığında, gezegenin etrafında on yıldır dönüyor olacak." },
      { type: "rule", text: "Bu tense'i pekiştiren son bir karşılaştırma daha yapalım: Present Perfect Continuous şimdiye kadar geçen süreyi, Future Perfect Continuous ise gelecekteki bir noktaya kadar geçecek süreyi anlatır." },
      { type: "example", en: "I have been studying English for two years. (şimdiye kadar) / By next year, I will have been studying English for three years. (gelecekteki bir noktaya kadar)", tr: "İki yıldır İngilizce çalışıyorum. / Gelecek yıla kadar üç yıldır İngilizce çalışıyor olacağım." },
      { type: "example", en: "This structure, although rarely used in daily speech, becomes essential when precisely describing long-term future processes in written and academic English.", tr: "Bu yapı, günlük konuşmada nadiren kullanılsa da, yazılı ve akademik İngilizcede uzun vadeli gelecek süreçleri kesin bir şekilde anlatırken önem kazanır." },
    ],
  },
];

async function main() {
  for (const lesson of lessons) {
    const p = await writeLessonDocx(OUT_DIR, lesson);
    console.log("Yazıldı:", p);
  }
}

main();
