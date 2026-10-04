// Sık değişmeyen, herkese aynı olan sorgu sonuçlarını (ana sayfa sayıları gibi)
// kısa süre bellekte tutar. Sunucusuz ortamda her örnek kendi belleğini kullanır;
// en kötü durumda sorgu yeniden çalışır, veri en fazla `ttlMs` kadar eski olur.
const store = new Map<string, { at: number; value: unknown }>();

export async function ttlCached<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  const hit = store.get(key);
  if (hit && Date.now() - hit.at < ttlMs) return hit.value as T;
  const value = await load();
  store.set(key, { at: Date.now(), value });
  return value;
}
