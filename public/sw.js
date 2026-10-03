// Ardemy Academy: tarayıcıların "uygulama olarak yükle" önerisi için gereken
// minimal servis çalışanı. Önbellek tutmaz, istekleri olduğu gibi ağa iletir.
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => event.waitUntil(self.clients.claim()));
self.addEventListener("fetch", () => {});
