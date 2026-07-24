const TURKISH_MAP: Record<string, string> = {
  ç: "c",
  ğ: "g",
  ı: "i",
  ö: "o",
  ş: "s",
  ü: "u",
  İ: "i",
  Ç: "c",
  Ğ: "g",
  Ö: "o",
  Ş: "s",
  Ü: "u",
};

export function slugifyName(name: string) {
  const normalized = name
    .split("")
    .map((char) => TURKISH_MAP[char] ?? char)
    .join("")
    .toLowerCase();

  return normalized.replace(/[^a-z0-9]+/g, ".").replace(/^\.+|\.+$/g, "");
}

const PASSWORD_CHARS =
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#%";

export function generatePassword(length = 12) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => PASSWORD_CHARS[b % PASSWORD_CHARS.length]).join(
    ""
  );
}
