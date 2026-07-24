// iyzico hesabı henüz kurulmadığı için ödeme burada TEST MODU'nda simüle
// ediliyor: gerçek para hareketi yok, işlem anında "başarılı" sayılıyor.
//
// Gerçek iyzico entegrasyonuna geçerken yapılacaklar:
// 1. `npm install iyzipay` ve .env'e IYZICO_API_KEY / IYZICO_SECRET_KEY / IYZICO_BASE_URL ekle.
// 2. Bu dosyadaki `chargeCard` fonksiyonunun içini iyzico Checkout Form/Payment
//    API çağrısıyla değiştir; dönüşe göre { success, iyzicoPaymentId } döndür.
// 3. Çağıran kodların (credits/actions.ts) hiçbir şeyini değiştirmeye gerek yok.

export const PAYMENT_TEST_MODE = true;

export async function chargeCard(_amount: number): Promise<{
  success: boolean;
  iyzicoPaymentId: string;
}> {
  return {
    success: true,
    iyzicoPaymentId: `TEST-${Date.now()}`,
  };
}
