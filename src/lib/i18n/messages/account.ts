// Şifre sıfırlama ve "uygulama gibi ekle" metinleri: [Türkçe, İngilizce, Rusça]
import type { MessageEntry } from "./index";

export const account: MessageEntry[] = [
  ["Şifremi unuttum", "Forgot password?", "Забыли пароль?"],
  ["Şifremi Unuttum", "Forgot Password", "Восстановление пароля"],
  ["E-posta adresinizi girin, size şifre sıfırlama linki gönderelim.", "Enter your e-mail address and we'll send you a password reset link.", "Введите ваш e-mail, и мы отправим ссылку для сброса пароля."],
  ["Sıfırlama Linki Gönder", "Send Reset Link", "Отправить ссылку для сброса"],
  ["Bu e-posta adresiyle kayıtlı bir hesap varsa şifre sıfırlama linki gönderdik. Linki bulamıyorsanız gereksiz/spam klasörünü kontrol edin.", "If an account exists with this e-mail address, we've sent a password reset link. If you can't find it, check your spam folder.", "Если аккаунт с этим e-mail существует, мы отправили ссылку для сброса пароля. Если письма нет, проверьте папку «Спам»."],
  ["E-posta adresiniz kayıtlı değilse (ör. eğitmeninizin oluşturduğu öğrenci hesabı) şifre sıfırlamasını eğitmeninizden isteyin.", "If your e-mail isn't on file (e.g. a student account created by your instructor), ask your instructor to reset your password.", "Если ваш e-mail не указан (например, аккаунт ученика создан преподавателем), попросите преподавателя сбросить пароль."],
  ["Yeni Şifre Belirle", "Set a New Password", "Установите новый пароль"],
  ["Yeni şifre", "New password", "Новый пароль"],
  ["Yeni şifre (tekrar)", "New password (again)", "Новый пароль (ещё раз)"],
  ["Güncelleniyor...", "Updating...", "Обновляем..."],
  ["Şifreyi Güncelle", "Update Password", "Обновить пароль"],
  ["Şifreniz güncellendi", "Your password has been updated", "Пароль обновлён"],
  ["Artık yeni şifrenizle giriş yapabilirsiniz.", "You can now log in with your new password.", "Теперь вы можете войти с новым паролем."],
  ["Geçersiz veya süresi dolmuş link", "Invalid or expired link", "Недействительная или просроченная ссылка"],
  ["Bu şifre sıfırlama linki geçersiz ya da süresi dolmuş. Lütfen yeni bir link isteyin.", "This password reset link is invalid or has expired. Please request a new one.", "Эта ссылка для сброса пароля недействительна или просрочена. Запросите новую."],
  ["Bu şifre sıfırlama linki geçersiz ya da süresi dolmuş.", "This password reset link is invalid or has expired.", "Эта ссылка для сброса пароля недействительна или просрочена."],
  ["Yeni link iste", "Request a new link", "Запросить новую ссылку"],
  ["Ardemy Academy - Şifre Sıfırlama", "Ardemy Academy - Password Reset", "Ardemy Academy — сброс пароля"],
  ["Hesabınız için şifre sıfırlama isteği aldık. Yeni şifre belirlemek için aşağıdaki linke tıklayın:", "We received a request to reset the password for your account. Click the link below to set a new password:", "Мы получили запрос на сброс пароля для вашего аккаунта. Чтобы задать новый пароль, перейдите по ссылке ниже:"],
  ["Bu linkin süresi 1 saattir. Bu isteği siz yapmadıysanız bu e-postayı yok sayabilirsiniz; şifreniz değişmez.", "This link is valid for 1 hour. If you did not make this request, you can ignore this e-mail; your password will not change.", "Ссылка действительна 1 час. Если вы не отправляли этот запрос, просто проигнорируйте письмо — пароль не изменится."],

  // ── Ana ekrana ekle (PWA) ──
  ["📲 Uygulama gibi kullan", "📲 Use it like an app", "📲 Используйте как приложение"],
  ["Siteyi ana ekranına ekle: tek dokunuşla aç, günlük sorunu ve serini kaçırma.", "Add the site to your home screen: open it with one tap and never miss your daily question or streak.", "Добавьте сайт на главный экран: открывайте одним касанием и не пропускайте вопрос дня и серию."],
  ["iPhone'da: Safari'de Paylaş düğmesine, ardından \"Ana Ekrana Ekle\"ye dokun.", "On iPhone: in Safari, tap the Share button, then \"Add to Home Screen\".", "На iPhone: в Safari нажмите «Поделиться», затем «На экран “Домой”»."],
  ["Ana ekrana ekle", "Add to home screen", "Добавить на главный экран"],
  ["Kapat", "Close", "Закрыть"],
];
