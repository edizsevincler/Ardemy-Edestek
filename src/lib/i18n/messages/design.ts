// Ana sayfa yenilemesi ve mobil gezinme metinleri: [Türkçe, İngilizce, Rusça]
import type { MessageEntry } from "./index";

export const design: MessageEntry[] = [
  // ── Alt gezinme çubuğu (telefon) ──
  ["Menü", "Menu", "Меню"],
  ["Öğrenci", "Student", "Ученик"],
  ["Deneme", "Mock exam", "Пробный"],

  // ── Ana sayfa: giriş bölümü ve canlı örnek ──
  ["Rusça ve İngilizce, her gün 5 dakika", "Russian and English, 5 minutes a day", "Русский и английский по 5 минут в день"],
  ["✨ Hemen dene", "✨ Try it now", "✨ Попробуйте сейчас"],
  ["🎉 Doğru bildin!", "🎉 You got it right!", "🎉 Правильно!"],
  ["Bu sefer olmadı, ama doğru cevap yukarıda 👆", "Not this time, but the correct answer is highlighted above 👆", "В этот раз не получилось, но правильный ответ выделен выше 👆"],
  ["Devamı için ücretsiz kayıt ol", "Sign up free to keep going", "Зарегистрируйтесь бесплатно, чтобы продолжить"],

  // ── Ana sayfa: neden Ardemy ──
  ["Neden Ardemy?", "Why Ardemy?", "Почему Ardemy?"],
  ["Günün Sorusu ve seri", "Daily Question and streak", "Вопрос дня и серия"],
  ["Her gün yeni bir soru çöz, serini koru; hediye ödüller kazan.", "Answer a new question every day, keep your streak and earn gift rewards.", "Отвечайте на новый вопрос каждый день, сохраняйте серию и получайте призы."],
  ["Deneme sınavları", "Mock exams", "Пробные экзамены"],
  ["Gerçek sınav havasında, süreli deneme sınavlarıyla seviyeni ölç.", "Measure your level with timed mock exams that feel like the real thing.", "Проверьте свой уровень на пробных экзаменах с таймером, как на настоящем."],
  ["Rozetler ve mağaza", "Badges and shop", "Награды и магазин"],
  ["Başardıkça rozet topla, kredilerinle unvan ve çerçeve al.", "Collect badges as you succeed and spend credits on titles and frames.", "Собирайте награды за успехи и покупайте на кредиты звания и рамки."],
  ["Birebir ders takibi", "One-to-one lesson tracking", "Индивидуальные занятия"],
  ["Ödevler, ders dosyaları ve mesajlarla öğretmeninle bağlantıda kal.", "Stay connected with your teacher through assignments, lesson files and messages.", "Оставайтесь на связи с преподавателем: задания, файлы уроков и сообщения."],
  ["Üç dilde arayüz", "Interface in three languages", "Интерфейс на трёх языках"],
  ["Türkçe, İngilizce ve Rusça: site tarayıcının diline göre açılır.", "Turkish, English and Russian: the site opens in your browser's language.", "Турецкий, английский и русский: сайт открывается на языке вашего браузера."],
  ["Telefonda uygulama gibi", "Like an app on your phone", "Как приложение на телефоне"],
  ["Ana ekrana ekle, tek dokunuşla aç; mobilde rahat kullan.", "Add it to your home screen, open it with one tap and enjoy a smooth mobile experience.", "Добавьте на главный экран, открывайте одним касанием и пользуйтесь удобно с телефона."],

  // ── Ana sayfa: seri ve rozetler ──
  ["Seriyi koru, rozetleri topla", "Keep the streak, collect the badges", "Держите серию, собирайте награды"],
  ["Her gün küçük bir adım at; seri uzadıkça rozetler ve ödüller açılır.", "Take a small step every day; badges and rewards unlock as your streak grows.", "Делайте маленький шаг каждый день: чем длиннее серия, тем больше наград."],

  // ── Ana sayfa: sık sorulan sorular ──
  ["Gerçekten ücretsiz mi?", "Is it really free?", "Это действительно бесплатно?"],
  ["Kayıt ücretsiz; kayıt olunca {n} kredi hediye edilir, kart bilgisi gerekmez. Günün Sorusu ve ücretsiz testler her zaman ücretsiz.", "Signing up is free; you get {n} gift credits when you register, no card details needed. The Daily Question and free tests are always free.", "Регистрация бесплатна; при регистрации вы получаете {n} кредитов в подарок, данные карты не нужны. Вопрос дня и бесплатные тесты всегда бесплатны."],
  ["Kredi ne işe yarıyor?", "What are credits for?", "Для чего нужны кредиты?"],
  ["Konu anlatımı, test ve soru gibi içeriklerin kilidini açmak için kullanılır. İstediğin zaman paketlerden ekleyebilirsin.", "Credits unlock content such as lessons, tests and questions. You can top up from the packages whenever you like.", "Кредиты открывают материалы: объяснения тем, тесты и вопросы. Пополнить их из пакетов можно в любой момент."],
  ["Telefonda kullanabilir miyim?", "Can I use it on my phone?", "Можно ли пользоваться с телефона?"],
  ["Evet. Siteyi tarayıcıdan ana ekranına ekleyip uygulama gibi açabilirsin; arayüz Türkçe, İngilizce ve Rusça desteklenir.", "Yes. Add the site to your home screen from your browser and open it like an app; the interface supports Turkish, English and Russian.", "Да. Добавьте сайт на главный экран из браузера и открывайте как приложение; интерфейс доступен на турецком, английском и русском."],

  // ── Ana sayfa: alt kısım ──
  ["Instagram'da takip et: @edizsevincler", "Follow on Instagram: @edizsevincler", "Подписывайтесь в Instagram: @edizsevincler"],
  // ── Koyu mod, seri kartı, deneme sonucu ──
  ["Koyu moda geç", "Switch to dark mode", "Включить тёмную тему"],
  ["Açık moda geç", "Switch to light mode", "Включить светлую тему"],
  ["✓ Bugün tamamlandı", "✓ Done for today", "✓ На сегодня выполнено"],
  ["Serin sürsün: bugünkü soruyu çöz", "Keep your streak alive: answer today's question", "Сохраните серию: ответьте на сегодняшний вопрос"],
  ["Doğru", "Correct", "Верно"],
  ["Yanlış", "Wrong", "Неверно"],
  ["Boş", "Blank", "Пропущено"],
  // ── Karşılama / hatırlatma e-postaları ve abonelik sayfası ──
  ["Ardemy Academy'ye hoş geldin! 🎉", "Welcome to Ardemy Academy! 🎉", "Добро пожаловать в Ardemy Academy! 🎉"],
  ["Hesabın aktif! İşte başlamak için üç küçük adım:", "Your account is active! Here are three small steps to get started:", "Ваш аккаунт активен! Вот три небольших шага для начала:"],
  ["📅 Günün Sorusu'nu çöz — ücretsiz, 1 dakika sürer.", "📅 Answer the Daily Question — it's free and takes 1 minute.", "📅 Ответьте на вопрос дня — бесплатно, займёт 1 минуту."],
  ["🎁 Hesabında {n} kredi seni bekliyor; bir konu veya test açmak için kullanabilirsin.", "🎁 You have {n} credits waiting in your account; use them to unlock a lesson or test.", "🎁 На вашем счёте {n} кредитов: используйте их, чтобы открыть тему или тест."],
  ["🔥 Her gün çöz, serini uzat, rozetleri topla.", "🔥 Practice every day, extend your streak and collect badges.", "🔥 Занимайтесь каждый день, продлевайте серию и собирайте награды."],
  ["Hemen başla", "Start now", "Начать сейчас"],
  ["🎯 İlk testini çözmeye ne dersin?", "🎯 How about solving your first test?", "🎯 Может, решим ваш первый тест?"],
  ["Hesabını açtın ama henüz bir soru çözmedin.", "You've created your account but haven't answered a question yet.", "Вы создали аккаунт, но ещё не ответили ни на один вопрос."],
  ["Hesabında {n} kredi seni bekliyor. İlk testini çözdüğünde “İlk Adım” rozetini kazanırsın.", "You have {n} credits waiting in your account. Solve your first test to earn the “First Step” badge.", "На вашем счёте {n} кредитов. Решите первый тест и получите награду «Первый шаг»."],
  ["Bu hatırlatma e-postalarını almak istemiyorsan", "If you don't want to receive these reminder e-mails,", "Если вы не хотите получать эти напоминания,"],
  ["buraya tıkla", "click here", "нажмите здесь"],
  ["E-posta tercihleri", "E-mail preferences", "Настройки e-mail"],
  ["Seri hatırlatmaları ve davet e-postalarını almayı bırakmak istiyor musun?", "Do you want to stop receiving streak reminders and invitation e-mails?", "Хотите перестать получать напоминания о серии и приглашения по e-mail?"],
  ["Evet, bu e-postaları alma", "Yes, stop these e-mails", "Да, больше не присылать эти письма"],
  ["Kaydediliyor...", "Saving...", "Сохраняем..."],
  ["Hatırlatma e-postaları kapatıldı. Şifre sıfırlama gibi hesabınla ilgili önemli e-postalar yine gelir.", "Reminder e-mails have been turned off. Important account e-mails, such as password resets, will still be sent.", "Напоминания отключены. Важные письма по аккаунту, например о сбросе пароля, по-прежнему будут приходить."],
  ["Bu bağlantı geçersiz.", "This link is invalid.", "Эта ссылка недействительна."],
  // ── Gizlilik politikası eklemeleri, ilerleme kartı ──
  ["Hesap e-postalarına (e-posta onayı, şifre sıfırlama) ek olarak, platformu kullanmanıza yardımcı olmak amacıyla karşılama, çalışma serisi hatırlatması ve ilk test daveti gibi hatırlatma e-postaları gönderebiliriz. Bu e-postaların altındaki bağlantıdan dilediğiniz zaman hatırlatma e-postalarını almayı bırakabilirsiniz; hesabınıza ilişkin zorunlu e-postalar bundan etkilenmez.", "In addition to account e-mails (e-mail confirmation, password reset), we may send reminder e-mails such as a welcome message, study-streak reminders and an invitation to take your first test, to help you get the most out of the platform. You can stop receiving reminder e-mails at any time using the link at the bottom of these e-mails; mandatory account e-mails are not affected.", "Помимо служебных писем (подтверждение e-mail, сброс пароля), мы можем отправлять напоминания: приветственное письмо, напоминания о серии занятий и приглашение пройти первый тест, чтобы вам было удобнее пользоваться платформой. Вы можете в любой момент отказаться от напоминаний по ссылке внизу письма; обязательные письма по аккаунту это не затрагивает."],
  ["Veri kaybını önlemek amacıyla veritabanının yedekleri düzenli olarak alınır; yedekler yalnızca Veri Sorumlusu tarafından saklanır ve yetkisiz kişilerle paylaşılmaz.", "To prevent data loss, backups of the database are taken regularly; backups are kept only by the Data Controller and are not shared with unauthorized persons.", "Чтобы избежать потери данных, резервные копии базы данных создаются регулярно; они хранятся только у Оператора данных и не передаются посторонним лицам."],
  ["İlerlememi paylaş", "Share my progress", "Поделиться прогрессом"],
  ["Ardemy Academy'de {tests} test çözdüm, {badges} rozet topladım! 🚀 Sen de dene: {url}", "I've solved {tests} tests and collected {badges} badges on Ardemy Academy! 🚀 Try it too: {url}", "Я прошёл(а) {tests} тестов и собрал(а) {badges} наград в Ardemy Academy! 🚀 Попробуй и ты: {url}"],
  ["Çözülen test", "Tests solved", "Пройдено тестов"],
  ["Rozet", "Badges", "Награды"],
  ["Günlük seri", "Day streak", "Дней подряд"],
  ["Sen de başla", "Start yours too", "Начните и вы"],
  ["{name} Ardemy'de ilerliyor 🚀", "{name} is making progress on Ardemy 🚀", "{name} делает успехи в Ardemy 🚀"],
  // ── Eğitmen tanıtımı ve yorumlar ──
  ["Eğitmenle tanış", "Meet your instructor", "Знакомство с преподавателем"],
  ["Ardemy Academy eğitmeni", "Ardemy Academy instructor", "Преподаватель Ardemy Academy"],
  ["Ardemy Academy'yi işleten eğitmen. Rusça ve İngilizce öğrenmek isteyenler için birebir ders takibini ve bu platformu yürütür; sorularınızı doğrudan ona yazabilirsiniz.", "The instructor who runs Ardemy Academy. He manages one-to-one lesson tracking and this platform for people who want to learn Russian and English; you can write your questions to him directly.", "Преподаватель, который ведёт Ardemy Academy. Он занимается индивидуальным сопровождением занятий и этой платформой для тех, кто хочет выучить русский и английский; вопросы можно писать ему напрямую."],
  ["Öğrenciler ne diyor?", "What do students say?", "Что говорят ученики?"],
  // ── Soruyu bildir ──
  ["🚩 Soruyu bildir", "🚩 Report this question", "🚩 Сообщить об ошибке в вопросе"],
  ["Sorunun neresi hatalı?", "What's wrong with this question?", "Что не так с этим вопросом?"],
  ["Doğru cevap yanlış işaretlenmiş", "The correct answer is marked wrong", "Правильный ответ отмечен неверно"],
  ["Birden fazla şık doğru olabilir", "More than one option could be correct", "Правильными могут быть несколько вариантов"],
  ["Soru anlaşılmıyor", "The question is unclear", "Вопрос непонятен"],
  ["Yazım hatası var", "There is a typo", "Есть опечатка"],
  ["Diğer", "Other", "Другое"],
  ["Eklemek istediğin not (isteğe bağlı)", "Anything you'd like to add (optional)", "Что хотите добавить (необязательно)"],
  ["Vazgeç", "Cancel", "Отмена"],
  ["Teşekkürler! Bildirimin için sağ ol, inceleyeceğiz.", "Thank you! We'll look into your report.", "Спасибо! Мы проверим ваше сообщение."],
  ["Bildirim için giriş yapmalısın.", "You need to log in to send a report.", "Чтобы отправить сообщение, нужно войти в аккаунт."],
  ["Bildirim gönderilemedi, biraz sonra tekrar dene.", "The report could not be sent, please try again shortly.", "Не удалось отправить сообщение, повторите попытку чуть позже."],
  ["Bugün çok fazla bildirim gönderdin, yarın tekrar dene.", "You've sent too many reports today, please try again tomorrow.", "Сегодня вы отправили слишком много сообщений, попробуйте завтра."],
];
