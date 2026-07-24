"use client";

import { resetStudentPassword } from "./actions";

export function ResetPasswordButton({
  studentId,
  studentName,
}: {
  studentId: string;
  studentName: string;
}) {
  return (
    <button
      type="button"
      onClick={async () => {
        if (
          !confirm(
            `${studentName} için yeni bir şifre oluşturulacak, mevcut şifresi geçersiz olacak. Devam edilsin mi?`
          )
        )
          return;
        const { password } = await resetStudentPassword(studentId);
        alert(`${studentName} için yeni şifre: ${password}\n\nBu şifreyi öğrenciye iletin, bir daha gösterilmeyecek.`);
      }}
      className="text-brand-600 underline hover:text-brand-800"
    >
      Şifreyi Sıfırla
    </button>
  );
}
