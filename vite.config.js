import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    VitePWA({
      registerType: "autoUpdate",

      includeAssets: [
        "favicon-32.png",
        "favicon-64.png",
        "logo.png",
        "icon-192.png",
        "icon-512.png"
      ],

      manifest: {
        name: "MergeMate",
        short_name: "MergeMate",
        description: "Fast • Free • Private PDF Toolkit",
        theme_color: "#4F46E5",
        background_color: "#F8FAFC",
        display: "standalone",
        orientation: "portrait",
        scope: "/",
        start_url: "/",

        icons: [
          {
            src: "icon-192.png",
            sizes: "192x192",
            type: "image/png"
          },
          {
            src: "icon-512.png",
            sizes: "512x512",
            type: "image/png"
          },
          {
            src: "icon-512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable any"
          }
        ]
      },

      workbox: {
        globPatterns: ["**/*.{js,css,html,png,svg,ico,webmanifest}"],

        runtimeCaching: [
          {
            urlPattern: ({ request }) =>
              request.destination === "document",
            handler: "NetworkFirst",
            options: {
              cacheName: "pages-cache"
            }
          },
          {
            urlPattern: ({ request }) =>
              ["script", "style", "image"].includes(request.destination),
            handler: "CacheFirst",
            options: {
              cacheName: "assets-cache"
            }
          }
        ]
      }
    })
  ]
});