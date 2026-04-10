const CACHE_NAME = 'kinetic-shell-v2'
const APP_SHELL = [
    '/',
    '/manifest.webmanifest',
    '/favicon.svg',
    '/apple-touch-icon.png',
    '/icons/pwa-192.png',
    '/icons/pwa-512.png',
    '/icons/pwa-maskable-192.png',
    '/icons/pwa-maskable-512.png',
]

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
        event.respondWith(
            fetch(request).catch(async () => {
                const cache = await caches.open(CACHE_NAME)

                return cache.match('/')
            }),
        )

        return
    }

    event.respondWith(
        caches.match(request).then((cachedResponse) => {
            const networkRequest = fetch(request)
                .then((networkResponse) => {
                    const responseClone = networkResponse.clone()

                    caches.open(CACHE_NAME).then((cache) => cache.put(request, responseClone))

                    return networkResponse
                })
                .catch(() => cachedResponse)

            return cachedResponse ?? networkRequest
        }),
    )
})