import type { Metadata } from "next";
import Link from "next/link";
import { Fragment, type ReactNode } from "react";
import { Logo } from "@/components/Logo";
import { Footer } from "@/components/Footer";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { getI18n } from "@/lib/i18n/server";

const EMAIL = "sevinclere@gmail.com";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getI18n();
  return { title: t("Mesafeli Satış Sözleşmesi — Ardemy Academy") };
}

// Metindeki {email} yer tutucusunu e-posta bağlantısıyla değiştirir.
function withEmail(text: string): ReactNode {
  return text.split("{email}").map((part, i, all) => (
    <Fragment key={i}>
      {part}
      {i < all.length - 1 && (
        <a href={`mailto:${EMAIL}`} className="text-brand-600 underline">
          {EMAIL}
        </a>
      )}
    </Fragment>
  ));
}

export default async function DistanceSalesAgreementPage() {
  const { locale, t } = await getI18n();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo size={32} />
            <span className="font-semibold text-brand-950">Ardemy Academy</span>
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link href="/login" className="text-sm text-brand-600 hover:underline">
              {t("Giriş Yap")}
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-4 py-10 sm:px-6">
        <div>
          <h1 className="text-2xl font-semibold text-brand-950">
            {t("Mesafeli Satış Sözleşmesi")}
          </h1>
          <p className="mt-1 text-sm text-slate-400">{t("Son güncelleme: Ekim 2026")}</p>
          {locale !== "tr" && (
            <p className="mt-3 rounded-lg border border-gold-200 bg-gold-50 px-3 py-2 text-sm text-slate-700">
              {t("Bu metin kolaylık için çevrilmiştir. Çeviri ile Türkçe metin arasında fark olması halinde Türkçe metin esas alınır.")}
            </p>
          )}
        </div>

        <div className="space-y-6 text-sm leading-relaxed text-slate-700">
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-brand-950">{t("1. Taraflar")}</h2>
            <p>{t("Satıcı: Ediz Sevinçler, Ardemy Academy platformunu işletmektedir.")}</p>
            <p>{withEmail(t("İletişim: {email}"))}</p>
            <p>{t("Alıcı: Ardemy Academy platformunda hesap oluşturarak kredi paketi satın alan gerçek kişi.")}</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-brand-950">{t("2. Sözleşmenin Konusu")}</h2>
            <p>{t("İşbu sözleşmenin konusu, Alıcı'nın Ardemy Academy platformu üzerinden elektronik ortamda satın aldığı kredi paketleri karşılığında, platformdaki dijital eğitim içeriklerine (konu anlatımı, soru/test bankası vb.) erişim hakkı kazanmasına ilişkin tarafların hak ve yükümlülüklerinin belirlenmesidir. Satılan ürün fiziksel bir mal değil, elektronik ortamda anında sunulan dijital içerik erişimidir.")}</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-brand-950">{t("3. Ürün Bilgisi ve Bedel")}</h2>
            <p>{t("Satışa sunulan kredi paketlerinin isimleri, içerdiği kredi miktarı ve güncel satış fiyatları, satın alma anında /guest/credits sayfasında Türk Lirası (TL) olarak, KDV dahil şekilde gösterilir. Alıcı, ödeme işlemini başlatmadan önce bu bilgileri görüntüleyerek onaylamış sayılır.")}</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-brand-950">{t("4. Ödeme Şekli")}</h2>
            <p>{t("Ödemeler banka havalesi/EFT yoluyla, platformda belirtilen hesaba yapılır. Alıcı ödemeyi gönderdikten sonra sistem üzerinden \"Havaleyi Gönderdim\" bildirimini yapar; Satıcı, ödemenin hesaba geçtiğini teyit ettikten sonra kredi tutarını Alıcı'nın hesabına en kısa sürede tanımlar. Kart bilgisi Satıcı tarafından hiçbir şekilde görülmez veya saklanmaz.")}</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-brand-950">{t("5. İfa (Teslimat)")}</h2>
            <p>{t("Kredi paketi, ödemenin onaylanmasının ardından anında ve elektronik ortamda Alıcı'nın hesabına tanımlanır; ayrıca bir kargo/teslimat süreci bulunmamaktadır.")}</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-brand-950">{t("6. Cayma Hakkı")}</h2>
            <p>{t("6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli Sözleşmeler Yönetmeliği'nin 15/1-ğ maddesi uyarınca, elektronik ortamda anında ifa edilen ve tüketicinin onayıyla ifasına hemen başlanan dijital içerik ve hizmetlerde cayma hakkı bulunmamaktadır. Satın alınan kredi paketi, ödemenin onaylanmasıyla birlikte anında Alıcı'nın hesabına tanımlandığından (ifaya hemen başlandığından), Alıcı işbu sözleşme kapsamında cayma hakkını kullanamaz ve satın alınan krediler iade edilmez.")}</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-brand-950">{t("7. Fikri Mülkiyet ve İçerik Kullanım Kuralları")}</h2>
            <p>{t("Platformda yer alan tüm konu anlatımları, testler, sorular ve dosyalar (\"İçerik\") Satıcı'nın fikri mülkiyetindedir ve 5846 sayılı Fikir ve Sanat Eserleri Kanunu kapsamında korunur. Alıcı, satın aldığı veya kredi ile açtığı İçeriği yalnızca kendi kişisel eğitim amacıyla kullanabilir.")}</p>
            <p>{t("İçeriğin tamamının veya bir kısmının izinsiz kopyalanması, çoğaltılması, ekran görüntüsü/kaydı alınarak veya başka bir şekilde üçüncü kişilerle paylaşılması, herhangi bir platformda yeniden yayınlanması veya satılması kesinlikle yasaktır. Bu kurala aykırı davranış tespit edilirse Satıcı, ilgili hesabı önceden bildirimde bulunmaksızın askıya alma/kapatma ve hukuki yollara başvurma hakkını saklı tutar.")}</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-brand-950">{t("8. Uyuşmazlıkların Çözümü")}</h2>
            <p>{t("İşbu sözleşmeden doğan uyuşmazlıklarda, Ticaret Bakanlığı'nca her yıl belirlenen parasal sınırlar dahilinde Alıcı'nın veya Satıcı'nın yerleşim yerindeki Tüketici Hakem Heyetleri, bu sınırı aşan uyuşmazlıklarda ise Tüketici Mahkemeleri yetkilidir.")}</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-brand-950">{t("9. Yürürlük")}</h2>
            <p>{t("Alıcı, kredi satın alma işlemini onaylayarak (\"Havaleyi Gönderdim\" butonuna basarak) işbu sözleşmenin tüm koşullarını okuduğunu ve kabul ettiğini beyan eder.")}</p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
