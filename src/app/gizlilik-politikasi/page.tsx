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
  return {
    title: t("Gizlilik Politikası ve KVKK Aydınlatma Metni — Ardemy Academy"),
  };
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

export default async function PrivacyPolicyPage() {
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
            {t("Gizlilik Politikası ve KVKK Aydınlatma Metni")}
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
            <h2 className="text-base font-semibold text-brand-950">{t("1. Veri Sorumlusu")}</h2>
            <p>{t("6698 sayılı Kişisel Verilerin Korunması Kanunu (\"KVKK\") uyarınca, Ardemy Academy platformunu işleten Ediz Sevinçler (\"Veri Sorumlusu\"), aşağıda açıklanan kişisel verilerinizi işlemektedir.")}</p>
            <p>{withEmail(t("İletişim: {email}"))}</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-brand-950">{t("2. İşlenen Kişisel Veriler")}</h2>
            <p>{t("Platformu kullanırken aşağıdaki kişisel verileriniz işlenebilir:")}</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>{t("Kimlik ve iletişim bilgileri (ad soyad, kullanıcı adı, e-posta)")}</li>
              <li>{t("Hesap bilgileri (şifre — geri döndürülemez biçimde şifrelenmiş olarak saklanır)")}</li>
              <li>{t("Eğitim faaliyetine ilişkin veriler (ders dosyaları, ödevler, ödev teslimleri, çözülen sorular/testler ve sonuçları, öğretmen-öğrenci mesajlaşma içeriği, çalışma serisi/streak kayıtları)")}</li>
              <li>{t("Ödeme ile ilgili sınırlı veriler (satın alınan kredi paketi, tutar, ödeme durumu — kart bilgileriniz platform tarafından hiçbir şekilde görülmez veya saklanmaz, ödemeler banka havalesi/EFT yoluyla yapılır)")}</li>
              <li>{t("Teknik veriler (oturum çerezi, IP adresi, tarayıcı bilgisi)")}</li>
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-brand-950">{t("3. İşlenme Amaçları ve Hukuki Sebep")}</h2>
            <p>{t("Kişisel verileriniz; hesabınızın oluşturulması ve kimlik doğrulaması, size özel ders/ödev içeriklerinin sunulması, soru bankası ve kredi sisteminin işletilmesi, ödeme süreçlerinin yürütülmesi, sizinle iletişim kurulması ve yasal yükümlülüklerin yerine getirilmesi amaçlarıyla, KVKK m.5'te sayılan \"bir sözleşmenin kurulması veya ifasıyla doğrudan doğruya ilgili olma\" ve \"veri sorumlusunun meşru menfaati\" hukuki sebeplerine dayanılarak işlenmektedir.")}</p>
            <p>{t("Hesap e-postalarına (e-posta onayı, şifre sıfırlama) ek olarak, platformu kullanmanıza yardımcı olmak amacıyla karşılama, çalışma serisi hatırlatması ve ilk test daveti gibi hatırlatma e-postaları gönderebiliriz. Bu e-postaların altındaki bağlantıdan dilediğiniz zaman hatırlatma e-postalarını almayı bırakabilirsiniz; hesabınıza ilişkin zorunlu e-postalar bundan etkilenmez.")}</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-brand-950">{t("4. Kişisel Verilerin Aktarılması")}</h2>
            <p>{t("Verileriniz, platformun teknik altyapısını sağlayan hizmet sağlayıcılarla (veritabanı barındırma, dosya depolama, e-posta gönderim servisi gibi) sınırlı olarak ve yalnızca hizmetin işletilmesi amacıyla paylaşılır. Bu hizmet sağlayıcılardan bazıları yurt dışında (ör. ABD merkezli sunucular) veri barındırabilir; bu durumda verileriniz KVKK m.9 kapsamında, hesap oluştururken verdiğiniz açık rıza çerçevesinde yurt dışına aktarılabilir. Verileriniz hiçbir şekilde pazarlama amacıyla üçüncü taraflara satılmaz veya kiralanmaz.")}</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-brand-950">{t("5. Saklama Süresi")}</h2>
            <p>{t("Kişisel verileriniz, işlenme amacının gerektirdiği süre boyunca ve ilgili mevzuatta öngörülen zamanaşımı süreleri saklı kalmak kaydıyla saklanır. Hesabınızın silinmesini talep etmeniz halinde verileriniz, yasal saklama yükümlülükleri dışında makul bir süre içinde silinir veya anonim hale getirilir.")}</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-brand-950">{t("6. Haklarınız (KVKK m.11)")}</h2>
            <p>{t("KVKK'nın 11. maddesi uyarınca her zaman:")}</p>
            <ul className="list-disc space-y-1 pl-5">
              <li>{t("Kişisel verilerinizin işlenip işlenmediğini öğrenme,")}</li>
              <li>{t("İşlenmişse buna ilişkin bilgi talep etme,")}</li>
              <li>{t("İşlenme amacını ve amacına uygun kullanılıp kullanılmadığını öğrenme,")}</li>
              <li>{t("Yurt içinde/dışında aktarıldığı üçüncü kişileri bilme,")}</li>
              <li>{t("Eksik/yanlış işlenmişse düzeltilmesini isteme,")}</li>
              <li>{t("KVKK'da öngörülen şartlarda silinmesini/yok edilmesini isteme,")}</li>
              <li>{t("Bu işlemlerin, verilerin aktarıldığı üçüncü kişilere bildirilmesini isteme,")}</li>
              <li>{t("İşlenen verilerin münhasıran otomatik sistemlerle analiz edilmesi sonucu aleyhinize bir sonucun ortaya çıkmasına itiraz etme,")}</li>
              <li>{t("Kanuna aykırı işlenme nedeniyle zarara uğramanız halinde zararın giderilmesini talep etme")}</li>
            </ul>
            <p>{withEmail(t("haklarına sahipsiniz. Bu haklarınızı kullanmak için {email} adresine yazılı olarak başvurabilirsiniz."))}</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-brand-950">{t("7. Çerezler (Cookies)")}</h2>
            <p>{t("Platform, oturumunuzu açık tutmak ve dil tercihinizi (ardemy_lang) hatırlamak için zorunlu çerezler kullanır. Ayrıca, siteye hangi bağlantıdan (ör. sosyal medya) geldiğinizi öğrenmek için 30 gün geçerli birinci taraf bir kaynak çerezi (ardemy_src) kullanılabilir; bu çerez yalnızca kayıt olduğunuzda hangi kanaldan geldiğinizi kaydetmek içindir ve üçüncü taraflarla paylaşılmaz. Reklam veya analiz amaçlı üçüncü taraf çerezleri kullanılmamaktadır. Sitenin herkese açık sayfalarının kaç kez görüntülendiği, kişi veya cihaz bilgisi tutulmadan yalnızca toplam sayı olarak anonim biçimde sayılır.")}</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-brand-950">{t("8. Veri Güvenliği")}</h2>
            <p>{t("Şifreniz geri döndürülemez biçimde (hash'lenerek) saklanır, tüm bağlantılar şifreli (HTTPS) olarak sağlanır ve verilerinize yalnızca yetkili erişimle ulaşılabilir. Buna rağmen internet üzerinden hiçbir veri iletiminin %100 güvenli olmadığını hatırlatırız.")}</p>
            <p>{t("Veri kaybını önlemek amacıyla veritabanının yedekleri düzenli olarak alınır; yedekler yalnızca Veri Sorumlusu tarafından saklanır ve yetkisiz kişilerle paylaşılmaz.")}</p>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold text-brand-950">{t("9. Değişiklikler")}</h2>
            <p>{t("Bu metin zaman zaman güncellenebilir; güncel sürüm her zaman bu sayfada yayınlanır.")}</p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
