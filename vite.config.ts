import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';
import {VitePWA} from 'vite-plugin-pwa';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: [
          'favicon.ico',
          'apple-touch-icon.png',
          'pwa-192x192.png',
          'pwa-maskable-192x192.png',
          'pwa-512x512.png',
          'pwa-maskable-512x512.png',
          'play-feature-graphic.png',
          'manifest.json',
          'manifest.webmanifest',
          'assets/aistudio/SECRET_LOGS_b4791025.png',
        ],
        manifestFilename: 'manifest.json',
        manifest: {
          id: '/',
          name: 'SecretLogs - Diary & Notes',
          short_name: 'SecretLogs',
          description: 'Offline, account-free private diary for Android with biometric lock, AES local encryption, and secure PDF/JPEG export.',
          lang: 'en',
          dir: 'ltr',
          theme_color: '#E83375',
          background_color: '#F4F3F7',
          display: 'standalone',
          display_override: ['standalone', 'window-controls-overlay', 'minimal-ui'],
          start_url: '/',
          scope: '/',
          orientation: 'portrait',
          categories: ['lifestyle', 'productivity', 'utilities'],
          prefer_related_applications: false,
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-192x192.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'maskable',
            },
            {
              src: '/pwa-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any',
            },
            {
              src: '/pwa-maskable-512x512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
          screenshots: [
            {
              src: '/assets/aistudio/one_year_iOS_Onboarding_0_57dfdd32.png',
              sizes: '1180x2676',
              type: 'image/png',
              form_factor: 'narrow',
              label: 'Daily Timeline and Journal Overview',
            },
            {
              src: '/assets/aistudio/one_year_iOS_Onboarding_1_5e4af1ce.png',
              sizes: '1180x2676',
              type: 'image/png',
              form_factor: 'narrow',
              label: '365-Day Interactive Year Garden',
            },
            {
              src: '/assets/aistudio/one_year_iOS_Onboarding_2_bb6c3a06.png',
              sizes: '1180x2676',
              type: 'image/png',
              form_factor: 'narrow',
              label: 'Encrypted Journal Entries and Attachments',
            },
            {
              src: '/play-feature-graphic.png',
              sizes: '1024x500',
              type: 'image/png',
              form_factor: 'wide',
              label: 'SecretLogs Android Private Diary & Vault',
            },
          ],
          shortcuts: [
            {
              name: 'New Entry',
              short_name: 'New',
              description: 'Write a new journal entry',
              url: '/?action=new',
              icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
            },
            {
              name: 'Year Garden',
              short_name: 'Garden',
              description: 'View 365-day log grid',
              url: '/?tab=year',
              icons: [{ src: '/pwa-192x192.png', sizes: '192x192' }],
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'gstatic-fonts-cache',
                expiration: {
                  maxEntries: 10,
                  maxAgeSeconds: 60 * 60 * 24 * 365,
                },
                cacheableResponse: {
                  statuses: [0, 200],
                },
              },
            },
          ],
        },
        devOptions: {
          enabled: true,
          type: 'module',
        },
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
