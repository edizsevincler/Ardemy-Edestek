// Son tarih sadece gün olarak seçildiği için (saat bilgisi yok), son tarihin
// gün sonuna kadar teslim edilmesi zamanında sayılır — o günün başlangıcıyla
// karşılaştırmak, son gün içinde teslim edenleri de "geç" gösterirdi.
import { makeT, type TFunction } from "@/lib/i18n/translate";

export function getLateLabel(
  dueDate: Date | null,
  submittedAt: Date,
  t: TFunction = makeT(null)
) {
  if (!dueDate) return null;

  const deadline = new Date(dueDate);
  deadline.setHours(23, 59, 59, 999);

  const diffMs = submittedAt.getTime() - deadline.getTime();
  if (diffMs <= 0) return null;

  const minutes = Math.floor(diffMs / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return t("{n} gün", { n: days });
  if (hours > 0) return t("{n} saat", { n: hours });
  return t("{n} dakika", { n: Math.max(minutes, 1) });
}
