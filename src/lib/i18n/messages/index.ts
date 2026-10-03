// Çeviri tablosu: her satır [Türkçe kaynak, İngilizce, Rusça].
// Yeni metin eklerken Türkçe kaynak, kodda t("...") içine yazılan metinle
// birebir aynı olmalı. Eksik/fazla anahtarları `npm run i18n:check` bulur.

import { common } from "./common";
import { legal } from "./legal";
import { panel } from "./panel";
import { badges } from "./badges";
import { account } from "./account";
import { titles } from "./titles";

export type MessageEntry = readonly [tr: string, en: string, ru: string];

export const MESSAGES: MessageEntry[] = [...common, ...legal, ...panel, ...badges, ...account, ...titles];
