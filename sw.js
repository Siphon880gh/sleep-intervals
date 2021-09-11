self.addEventListener("install", event => {
    // The promise that skipWaiting() returns can be safely ignored.
    self.skipWaiting();

    event.waitUntil(
        caches.open("precache-v2").then(cache => {
            // Caching path does not have to be preceded with `public/` because starting the path with `/`
            // will start off the path from wherever Express delivered the HTML route
            const filesToCache = [
                "/tools/sleep-intervals/index.html",
                "/tools/sleep-intervals/assets/css/index.css",
                "/tools/sleep-intervals/assets/js/app.js",
                "/tools/sleep-intervals/assets/js/poller.js",
                "/tools/sleep-intervals/manifest.json",
                "/tools/sleep-intervals/sw.js"
            ];

            cache.addAll(filesToCache);
        })
    );
});

self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});