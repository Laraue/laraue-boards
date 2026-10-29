import { fileURLToPath } from 'node:url'

import { defineNuxtConfig } from 'nuxt/config'

import { laraueLogoUrl } from './layers/core/app/branding/laraueIcons'
import { githubRepositoryUrl } from './layers/core/app/constants/links'

// Public origin of the site (override with NUXT_PUBLIC_SITE_URL): canonical, hreflang and sitemap
// URLs are built from it.
const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || 'https://boards.laraue.com'

// https://nuxt.com/docs/api/configuration/nuxt-config
// Host config. The areas are Nuxt layers in `layers/` (core, site, docs, workspace), registered
// automatically.
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
          href: 'https://fonts.googleapis.com/css2?family=Caveat:wght@500;600;700&family=Geist:wght@400;500;600;700;800&family=Geist+Mono:wght@400;500;600&display=swap',
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
  // Project components use file imports; Nuxt's built-ins are explicitly imported from #components.
  components: { dirs: [] },
  devtools: { enabled: true },

  experimental: {
    typedPages: true,
  },
  gtag: {
    enabled: process.env.NODE_ENV === 'production',
    id: 'G-RGM3JHLBGL',
    // The Google tag script is only added once analytics is allowed for the visitor (see
    // app.vue and CookieConsent) - never for visitors from countries where
    // Google Analytics can't be used (see layers/core/app/analytics/consent/decision.ts).
    initCommands: [['consent', 'default', { analytics_storage: 'denied' }]],
    initMode: 'manual',
  },
  i18n: {
    baseUrl: siteUrl,
    defaultLocale: 'en',
    detectBrowserLanguage: { cookieKey: 'locale', redirectOn: 'root', useCookie: true },
    locales: [
      {
        code: 'en',
        language: 'en-US',
        name: 'English',
      },
      {
        code: 'ru',
        language: 'ru-RU',
        name: 'Русский',
      },
    ],
    strategy: 'prefix_except_default',
    vueI18n: fileURLToPath(new URL('./i18n.config.ts', import.meta.url)),
  },

  imports: {
    autoImport: false,
    scan: false,
  },

  modules: ['@nuxtjs/i18n', 'nuxt-gtag', '@nuxtjs/sitemap', 'nuxt-seo-utils', 'nuxt-schema-org'],

  // The organization behind the site, for every page's structured data (nuxt-schema-org adds it
  // with the WebSite and WebPage nodes).
  schemaOrg: {
    identity: {
      logo: laraueLogoUrl,
      name: 'Laraue Software',
      sameAs: [githubRepositoryUrl],
      type: 'Organization',
      url: 'https://laraue.com',
    },
  },

  // nuxt-seo-utils adds canonical, og:url, og:site_name, og:locale, og and twitter titles, and the
  // "Title · Laraue Boards" template. Pages without a title keep the plain site name.
  nitro: {
    compressPublicAssets: { brotli: true, gzip: true },
    imports: false,
  },

  seo: {
    automaticTwitterTags: false,
    fallbackTitle: false,
  },

  site: {
    name: 'Laraue Boards',
    separator: '·',
    url: siteUrl,
  },

  // The sitemap finds every page from the routes, with its languages. Each layer sets its own route
  // rules and sitemap settings: workspace leaves its private pages out, docs adds its articles.

  runtimeConfig: {
    public: {
      billingApiBaseUrl: '',
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
