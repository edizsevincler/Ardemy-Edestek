function maskWord(word: string) {
  const visible = word.slice(0, 2);
  return `${visible}•••`;
}

export function maskFullName(fullName: string) {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 1) {
    return maskWord(parts[0]);
  }
  const first = parts[0];
  const last = parts[parts.length - 1];
  return `${maskWord(first)} ${maskWord(last)}`;
}
