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
    // The Google tag script is only added once analytics is allowed for the visitor (see
    // plugins/consent-init.client.ts and CookieConsent) - never for visitors from countries where
    // Google Analytics can't be used (see utils/consent.ts).
    initCommands: [['consent', 'default', { analytics_storage: 'denied' }]],
    initMode: 'manual',
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
    // The docs pages come from the markdown files (see `server/routes/docs-sitemap-urls.get.ts`).
    sources: ['/docs-sitemap-urls'],
    urls: [
      { en: '/', ru: '/ru' },
      { en: '/terms', ru: '/ru/terms' },
      { en: '/compare/trello', ru: '/ru/compare/trello' },
    ]
      .flatMap(({ en, ru }) =>
        [en, ru].map((loc) => ({
          alternatives: [
            { href: en, hreflang: 'en' },
            { href: ru, hreflang: 'ru' },
            { href: en, hreflang: 'x-default' },
          ],
          loc,
        })),
      )
      // Comparisons that exist in English only have no alternates.
      .concat([{ alternatives: [], loc: '/compare/linear' }]),
  },

  // The documentation (`content/docs`) is bundled with the server and read by `server/utils/docsCatalog`.
  nitro: {
    serverAssets: [
      { baseName: 'docs', dir: fileURLToPath(new URL('./content/docs', import.meta.url)) },
    ],
  },

  // The app itself is private: keep it out of search results. Only the landing page is indexed.
  routeRules: {
    '/account': { headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
    // The docs are per language; the address without one goes to the English docs.
    '/documentation': { redirect: { statusCode: 301, to: '/en/documentation' } },
    // Data for the pages and the sitemap, not pages themselves.
    '/docs-content/**': { headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
    '/docs-sitemap-urls': { headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
    '/join/**': { headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
    '/landing/tariffs': { headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
    '/login': { headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
    '/organizations': { headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
    '/organizations/**': { headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
  },

  runtimeConfig: {
    // Billing API root, where `/api/tariffs` is reachable (NUXT_BILLING_API_BASE_URL). Server-only:
    // the landing page's prices are requested from this app's own `/landing/tariffs` route.
    billingApiBaseUrl: '',
    public: {
      boardsApiBaseUrl: '',
      googleClientId: '',
      retroApiBaseUrl: '',
      retroHubUrl: '',
      // Nuxt parses a numeric env value into a number, so read it with String(...).
      telegramBotId: '',
      testUserToken: '',
    },
  },
})
