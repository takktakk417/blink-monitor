const CACHE_NAME = "blink-monitor-v1";

const FILES = [
  "./",
  "./index.html",

  "./css/style.css",

  "./js/app.js",
  "./js/blink.js",
  "./js/camera.js",
  "./js/face.js",
  "./js/storage.js",
  "./js/ui.js",
  "./js/chart.js",

  "./assets/models/face_landmarker.task",

  "./assets/mediapipe/vision_bundle.mjs",
  "./assets/mediapipe/wasm/vision_wasm_internal.wasm"
];

const SAFE_FILES = FILES.filter(f =>
  !f.includes("mediapipe")
);

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(SAFE_FILES))
  );
});

self.addEventListener(
    "fetch",
    event => {

        event.respondWith(

            caches.match(event.request)
            .then(response =>

                response ||
                fetch(event.request)
            )
        );
    }
);