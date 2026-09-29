import { fileURLToPath } from 'node:url'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  alias: {
    '#infrastructure': fileURLToPath(new URL('./infrastructure', import.meta.url)),
  },

  app: {
    head: {
      link: [
        { href: 'https://fonts.googleapis.com', rel: 'preconnect' },
        { crossorigin: '', href: 'https://fonts.gstatic.com', rel: 'preconnect' },
        {
          href: 'https://fonts.googleapis.com/css2?family=Caveat:wght@500;600;700&family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap',
          rel: 'stylesheet',
        },
      ],
      meta: [
        {
          content: 'width=device-width, initial-scale=1, maximum-scale=1',
          name: 'viewport',
        },
      ],
    },
  },

  compatibilityDate: '2025-07-15',
  css: ['~/assets/css/tokens.css', '~/assets/css/main.css', '~/assets/css/tours.css'],
  devtools: { enabled: true },

  experimental: {
    typedPages: true,
  },
  gtag: {
    enabled: process.env.NODE_ENV === 'production',
    id: 'G-RGM3JHLBGL',
  },

  modules: ['nuxt-gtag', '@nuxtjs/sitemap'],

  // Public origin of the site (override with NUXT_PUBLIC_SITE_URL): canonical/hreflang URLs and the
  // sitemap are built from it.
  site: {
    url: 'https://boards.laraue.com',
  },

  // Only the landing page is listed. The app's own pages are private, so the sitemap doesn't
  // discover routes from the app and lists them explicitly.
  sitemap: {
    excludeAppSources: true,
    urls: ['/', '/ru'].map((loc) => ({
      alternatives: [
        { href: '/', hreflang: 'en' },
        { href: '/ru', hreflang: 'ru' },
        { href: '/', hreflang: 'x-default' },
      ],
      loc,
    })),
  },

  // The app itself is private: keep it out of search results. Only the landing page is indexed.
  routeRules: {
    '/account': { headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
    '/join/**': { headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
    '/login': { headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
    '/organizations': { headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
    '/organizations/**': { headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
  },

  runtimeConfig: {
    public: {
      boardsApiBaseUrl: '',
      // Billing API root, where `/api/tariffs` is reachable (tariffs on the landing page). The
      // browser calls it too, so it needs CORS for this site's origin.
      billingApiBaseUrl: '',
      googleClientId: '',
      retroApiBaseUrl: '',
      retroHubUrl: '',
      // Nuxt parses a numeric env value into a number, so read it with String(...).
      telegramBotId: '',
      testUserToken: '',
    },
  },
})
