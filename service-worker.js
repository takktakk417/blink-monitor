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

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {

      for (const file of FILES) {
        try {
          const res = await fetch(file);
          if (!res.ok) throw new Error("bad response");
          await cache.put(file, res);
        } catch (e) {
          console.warn("skip cache:", file);
        }
      }

    })
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