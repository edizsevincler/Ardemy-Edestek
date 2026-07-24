"use client";

import { resetGuestPassword } from "./actions";

export function ResetPasswordButton({
  userId,
  userName,
}: {
  userId: string;
  userName: string;
}) {
  return (
    <button
      type="button"
      onClick={async () => {
        if (
          !confirm(
            `${userName} için yeni bir şifre oluşturulacak, mevcut şifresi geçersiz olacak. Devam edilsin mi?`
          )
        )
          return;
        const { password } = await resetGuestPassword(userId);
        alert(`${userName} için yeni şifre: ${password}\n\nBu şifreyi kullanıcıya iletin, bir daha gösterilmeyecek.`);
      }}
      className="text-brand-600 underline hover:text-brand-800"
    >
      Şifreyi Sıfırla
    </button>
  );
}
