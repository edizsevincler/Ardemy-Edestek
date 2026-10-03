// Kullanım: npm run i18n:check
//
// Koddaki t("...") / tx("...") metinlerini src/lib/i18n/messages içindeki
// çeviri tablosuyla karşılaştırır:
//   • tabloda hiç olmayan metin  -> HATA (Türkçe kalır)
//   • İngilizce/Rusça boş olan   -> HATA
//   • tabloda olup kodda geçmeyen -> bilgi (artık kullanılmıyor olabilir)
//   • aynı Türkçe anahtarın birden fazla satırı -> HATA
// Admin paneli (src/app/admin, src/app/api/admin) kapsam dışıdır.

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { MESSAGES } from "../src/lib/i18n/messages";

const ROOT = join(process.cwd(), "src");
const SKIP = [
  join("src", "app", "admin"),
  join("src", "app", "api", "admin"),
  join("src", "generated"),
  join("src", "lib", "i18n"),
];

function walk(dir: string, out: string[] = []) {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const rel = relative(process.cwd(), full);
    if (SKIP.some((s) => rel === s || rel.startsWith(s + "\\") || rel.startsWith(s + "/"))) continue;
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.(ts|tsx)$/.test(name)) out.push(full);
  }
  return out;
}

function unescapeLiteral(raw: string): string {
  const quote = raw[0];
  const body = raw.slice(1, -1);
  if (quote === '"') return JSON.parse(raw);
  return body.replace(/\\(.)/g, (_, c: string) =>
    c === "n" ? "\n" : c === "t" ? "\t" : c
  );
}

const CALL = /(?<![\w.$])(?:t|tx)\(\s*("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\$]|\\.|\$(?!\{))*`)/g;
const DYNAMIC = /(?<![\w.$])(?:t|tx)\(\s*(?!["'`\s])/g;

const used = new Map<string, string[]>();
let dynamic = 0;
for (const file of walk(ROOT)) {
  const text = readFileSync(file, "utf8");
  for (const m of text.matchAll(CALL)) {
    const key = unescapeLiteral(m[1]);
    const list = used.get(key) ?? [];
    list.push(relative(process.cwd(), file));
    used.set(key, list);
  }
  dynamic += [...text.matchAll(DYNAMIC)].length;
}

const table = new Map<string, readonly [string, string, string]>();
const dupes: string[] = [];
for (const entry of MESSAGES) {
  if (table.has(entry[0])) dupes.push(entry[0]);
  table.set(entry[0], entry);
}

let errors = 0;
for (const [key, files] of used) {
  const entry = table.get(key);
  if (!entry) {
    errors++;
    console.log(`EKSİK : ${JSON.stringify(key)}  (${files[0]})`);
  } else if (!entry[1] || !entry[2]) {
    errors++;
    console.log(`BOŞ   : ${JSON.stringify(key)}  (${!entry[1] ? "en" : "ru"} boş)`);
  }
}
for (const key of dupes) {
  errors++;
  console.log(`TEKRAR: ${JSON.stringify(key)}`);
}

const unused = [...table.keys()].filter((k) => !used.has(k));
console.log(
  `\n${used.size} farklı metin kodda, ${table.size} satır tabloda. ` +
    `${errors} hata, ${unused.length} kullanılmayan satır, ${dynamic} dinamik t() çağrısı.`
);
if (process.argv.includes("--unused")) for (const k of unused) console.log("  kullanılmıyor:", JSON.stringify(k));
process.exit(errors > 0 ? 1 : 0);
