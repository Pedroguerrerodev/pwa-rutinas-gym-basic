const CACHE_NAME = 'kinetic-shell-v3'
const APP_SHELL = [
    '/',
    '/manifest.webmanifest',
    '/favicon.svg',
    '/apple-touch-icon.png',
    '/logo-kinetic.png',
    '/icons/pwa-192.png',
    '/icons/pwa-512.png',
    '/icons/pwa-maskable-192.png',
    '/icons/pwa-maskable-512.png',
]

async function networkFirst(request) {
    const cache = await caches.open(CACHE_NAME)

    try {
        const networkResponse = await fetch(request)
        cache.put(request, networkResponse.clone())
        return networkResponse
    } catch {
        const cachedResponse = await cache.match(request)
        if (cachedResponse) {
            return cachedResponse
        }

        throw new Error('Network unavailable and no cached response')
    }
}

async function cacheFirst(request) {
    const cache = await caches.open(CACHE_NAME)
    const cachedResponse = await cache.match(request)

    if (cachedResponse) {
        return cachedResponse
    }

    const networkResponse = await fetch(request)
    cache.put(request, networkResponse.clone())
    return networkResponse
}

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)),
    )
    self.skipWaiting()
})

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key)),
            ),
        ),
    )
    self.clients.claim()
})

self.addEventListener('fetch', (event) => {
    const { request } = event

    if (request.method !== 'GET') {
        return
    }

    const requestUrl = new URL(request.url)

    if (requestUrl.origin !== self.location.origin) {
        return
    }

    if (request.mode === 'navigate') {
        event.respondWith(networkFirst(request).catch(() => caches.match('/')))

        return
    }

    if (request.destination === 'script' || request.destination === 'style') {
        event.respondWith(networkFirst(request).catch(() => caches.match(request)))

        return
    }

    event.respondWith(cacheFirst(request).catch(() => caches.match(request)))
})