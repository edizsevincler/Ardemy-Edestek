import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Footer } from "@/components/Footer";

export const metadata = {
  title: "Gizlilik Politikası ve KVKK Aydınlatma Metni — Ardemy Academy",
};

export default function PrivacyPolicyPage() {
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
            Gizlilik Politikası ve KVKK Aydınlatma Metni
          </h1>
          <p className="mt-1 text-sm text-slate-400">Son güncelleme: Ekim 2026</p>
        </div>

        <div className="space-y-6 text-sm leading-relaxed text-slate-700">
          <section className="space-y-2">
            <h2 className="text-base font-semibold text-brand-950">1. Veri Sorumlusu</h2>
            <p>
              6698 sayılı Kişisel Verilerin Korunması Kanunu (&quot;KVKK&quot;) uyarınca,
              Ardemy Academy platformunu bireysel eğitmen sıfatıyla işleten{" "}
              <strong>Ediz Sevinçler</strong> (&quot;Veri Sorumlusu&quot;), aşağıda
              açıklanan kişisel verilerinizi işlemektedir. Platform tescilli bir şirket
              tarafından değil, bireysel bir eğitmen tarafından yürütülmektedir.
            </p>
            <p>
              İletişim: <a href="mailto:sevinclere@gmail.com" className="text-brand-600 underline">sevinclere@gmail.com</a>
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-brand-950">
              2. İşlenen Kişisel Veriler
            </h2>
            <p>Platformu kullanırken aşağıdaki kişisel verileriniz işlenebilir:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Kimlik ve iletişim bilgileri (ad soyad, kullanıcı adı, e-posta)</li>
              <li>Hesap bilgileri (şifre — geri döndürülemez biçimde şifrelenmiş olarak saklanır)</li>
              <li>
                Eğitim faaliyetine ilişkin veriler (ders dosyaları, ödevler, ödev
                teslimleri, çözülen sorular/testler ve sonuçları, öğretmen-öğrenci
                mesajlaşma içeriği, çalışma serisi/streak kayıtları)
              </li>
              <li>
                Ödeme ile ilgili sınırlı veriler (satın alınan kredi paketi, tutar,
                ödeme durumu — kart bilgileriniz platform tarafından hiçbir şekilde
                görülmez veya saklanmaz, ödemeler banka havalesi/EFT yoluyla yapılır)
              </li>
              <li>Teknik veriler (oturum çerezi, IP adresi, tarayıcı bilgisi)</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-brand-950">
              3. İşlenme Amaçları ve Hukuki Sebep
            </h2>
            <p>
              Kişisel verileriniz; hesabınızın oluşturulması ve kimlik doğrulaması,
              size özel ders/ödev içeriklerinin sunulması, soru bankası ve kredi
              sisteminin işletilmesi, ödeme süreçlerinin yürütülmesi, sizinle iletişim
              kurulması ve yasal yükümlülüklerin yerine getirilmesi amaçlarıyla, KVKK
              m.5&apos;te sayılan &quot;bir sözleşmenin kurulması veya ifasıyla doğrudan
              doğruya ilgili olma&quot; ve &quot;veri sorumlusunun meşru menfaati&quot;
              hukuki sebeplerine dayanılarak işlenmektedir.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-brand-950">
              4. Kişisel Verilerin Aktarılması
            </h2>
            <p>
              Verileriniz, platformun teknik altyapısını sağlayan hizmet
              sağlayıcılarla (veritabanı barındırma, dosya depolama, e-posta gönderim
              servisi gibi) sınırlı olarak ve yalnızca hizmetin işletilmesi amacıyla
              paylaşılır. Bu hizmet sağlayıcılardan bazıları yurt dışında (ör. ABD
              merkezli sunucular) veri barındırabilir; bu durumda verileriniz KVKK
              m.9 kapsamında, hesap oluştururken verdiğiniz açık rıza çerçevesinde
              yurt dışına aktarılabilir. Verileriniz hiçbir şekilde pazarlama
              amacıyla üçüncü taraflara satılmaz veya kiralanmaz.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-brand-950">
              5. Saklama Süresi
            </h2>
            <p>
              Kişisel verileriniz, işlenme amacının gerektirdiği süre boyunca ve
              ilgili mevzuatta öngörülen zamanaşımı süreleri saklı kalmak kaydıyla
              saklanır. Hesabınızın silinmesini talep etmeniz halinde verileriniz,
              yasal saklama yükümlülükleri dışında makul bir süre içinde silinir
              veya anonim hale getirilir.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-brand-950">
              6. Haklarınız (KVKK m.11)
            </h2>
            <p>KVKK&apos;nın 11. maddesi uyarınca her zaman:</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>Kişisel verilerinizin işlenip işlenmediğini öğrenme,</li>
              <li>İşlenmişse buna ilişkin bilgi talep etme,</li>
              <li>İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,</li>
              <li>Yurt içinde/dışında aktarıldığı üçüncü kişileri bilme,</li>
              <li>Eksik/yanlış işlenmişse düzeltilmesini isteme,</li>
              <li>KVKK&apos;da öngörülen şartlarda silinmesini/yok edilmesini isteme,</li>
              <li>Bu işlemlerin, verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme,</li>
              <li>
                İşlenen verilerin münhasıran otomatik sistemlerle analiz edilmesi
                sonucu aleyhinize bir sonucun ortaya çıkmasına itiraz etme,
              </li>
              <li>Kanuna aykırı işlenme nedeniyle zarara uğramanız halinde zararın giderilmesini talep etme</li>
            </ul>
            <p>
              haklarına sahipsiniz. Bu haklarınızı kullanmak için{" "}
              <a href="mailto:sevinclere@gmail.com" className="text-brand-600 underline">
                sevinclere@gmail.com
              </a>{" "}
              adresine yazılı olarak başvurabilirsiniz.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-brand-950">
              7. Çerezler (Cookies)
            </h2>
            <p>
              Platform, yalnızca oturumunuzu açık tutmak için zorunlu bir oturum
              çerezi kullanır. Reklam veya analiz amaçlı üçüncü taraf çerezleri
              kullanılmamaktadır.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-brand-950">
              8. Veri Güvenliği
            </h2>
            <p>
              Şifreniz geri döndürülemez biçimde (hash&apos;lenerek) saklanır, tüm
              bağlantılar şifreli (HTTPS) olarak sağlanır ve verilerinize yalnızca
              yetkili erişimle ulaşılabilir. Buna rağmen internet üzerinden hiçbir
              veri iletiminin %100 güvenli olmadığını hatırlatırız.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-brand-950">
              9. Değişiklikler
            </h2>
            <p>
              Bu metin zaman zaman güncellenebilir; güncel sürüm her zaman bu
              sayfada yayınlanır.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
