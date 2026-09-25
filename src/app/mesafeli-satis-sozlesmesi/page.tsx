import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Mesafeli Satış Sözleşmesi — Ardemy Academy",
};

export default function DistanceSalesAgreementPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Logo size={32} />
            <span className="font-semibold text-brand-950">Ardemy Academy</span>
          </Link>
          <Link href="/login" className="text-sm text-brand-600 hover:underline">
            Giriş Yap
          </Link>
        </div>
      </header>

      <main className="mx-auto w-full max-w-3xl flex-1 space-y-6 px-4 py-10 sm:px-6">
        <div>
          <h1 className="text-2xl font-semibold text-brand-950">
            Mesafeli Satış Sözleşmesi
          </h1>
          <p className="mt-1 text-sm text-slate-400">Son güncelleme: Ekim 2026</p>
        </div>

        <div className="space-y-6 text-sm leading-relaxed text-slate-700">
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-brand-950">1. Taraflar</h2>
            <p>
              <strong>Satıcı:</strong> Ediz Sevinçler, bireysel eğitmen sıfatıyla
              Ardemy Academy platformunu işletmektedir. Satıcının tescilli bir şirket
              kaydı bulunmamaktadır.
              <br />
              İletişim: <a href="mailto:sevinclere@gmail.com" className="text-brand-600 underline">sevinclere@gmail.com</a>
            </p>
            <p>
              <strong>Alıcı:</strong> Ardemy Academy platformunda hesap oluşturarak
              kredi paketi satın alan gerçek kişi.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-brand-950">
              2. Sözleşmenin Konusu
            </h2>
            <p>
              İşbu sözleşmenin konusu, Alıcı&apos;nın Ardemy Academy platformu
              üzerinden elektronik ortamda satın aldığı <strong>kredi paketleri</strong>{" "}
              karşılığında, platformdaki dijital eğitim içeriklerine (konu anlatımı,
              soru/test bankası vb.) erişim hakkı kazanmasına ilişkin tarafların hak
              ve yükümlülüklerinin belirlenmesidir. Satılan ürün fiziksel bir mal
              değil, elektronik ortamda anında sunulan dijital içerik erişimidir.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-brand-950">
              3. Ürün Bilgisi ve Bedel
            </h2>
            <p>
              Satışa sunulan kredi paketlerinin isimleri, içerdiği kredi miktarı ve
              güncel satış fiyatları, satın alma anında{" "}
              <span className="font-mono">/guest/credits</span> sayfasında Türk Lirası
              (TL) olarak, KDV dahil şekilde gösterilir. Alıcı, ödeme işlemini
              başlatmadan önce bu bilgileri görüntüleyerek onaylamış sayılır.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-brand-950">
              4. Ödeme Şekli
            </h2>
            <p>
              Ödemeler banka havalesi/EFT yoluyla, platformda belirtilen hesaba
              yapılır. Alıcı ödemeyi gönderdikten sonra sistem üzerinden
              &quot;Havaleyi Gönderdim&quot; bildirimini yapar; Satıcı, ödemenin
              hesaba geçtiğini teyit ettikten sonra kredi tutarını Alıcı&apos;nın
              hesabına en kısa sürede tanımlar. Kart bilgisi Satıcı tarafından
              hiçbir şekilde görülmez veya saklanmaz.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-brand-950">
              5. İfa (Teslimat)
            </h2>
            <p>
              Kredi paketi, ödemenin onaylanmasının ardından anında ve elektronik
              ortamda Alıcı&apos;nın hesabına tanımlanır; ayrıca bir kargo/teslimat
              süreci bulunmamaktadır.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-brand-950">
              6. Cayma Hakkı
            </h2>
            <p>
              6502 sayılı Tüketicinin Korunması Hakkında Kanun ve Mesafeli
              Sözleşmeler Yönetmeliği uyarınca, elektronik ortamda anında ifa edilen
              ve tüketicinin onayıyla ifasına başlanan dijital içeriklerde cayma
              hakkı, içeriğe erişim sağlandıktan sonra kullanılamaz (Yönetmelik
              m.15/1-ğ). Buna göre:
            </p>
            <ul className="list-disc space-y-1 pl-5">
              <li>
                Satın alınan kredilerin <strong>hiçbiri kullanılmamışsa</strong>{" "}
                (herhangi bir içerik açılmamışsa), Alıcı satın alma tarihinden
                itibaren <strong>14 gün içinde</strong> talep ederek iade alabilir.
              </li>
              <li>
                Kredilerin bir kısmı veya tamamı kullanılarak içerik açılmışsa, o
                kısma karşılık gelen tutar için cayma hakkı kullanılamaz.
              </li>
            </ul>
            <p>
              İade talepleri{" "}
              <a href="mailto:sevinclere@gmail.com" className="text-brand-600 underline">
                sevinclere@gmail.com
              </a>{" "}
              adresine yazılı olarak iletilmelidir.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-brand-950">
              7. Uyuşmazlıkların Çözümü
            </h2>
            <p>
              İşbu sözleşmeden doğan uyuşmazlıklarda, Ticaret Bakanlığı&apos;nca her
              yıl belirlenen parasal sınırlar dahilinde Alıcı&apos;nın veya
              Satıcı&apos;nın yerleşim yerindeki Tüketici Hakem Heyetleri, bu sınırı
              aşan uyuşmazlıklarda ise Tüketici Mahkemeleri yetkilidir.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-brand-950">
              8. Yürürlük
            </h2>
            <p>
              Alıcı, kredi satın alma işlemini onaylayarak (&quot;Havaleyi
              Gönderdim&quot; butonuna basarak) işbu sözleşmenin tüm koşullarını
              okuduğunu ve kabul ettiğini beyan eder.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
