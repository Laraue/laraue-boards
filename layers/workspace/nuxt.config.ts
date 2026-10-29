import { fileURLToPath } from 'node:url'

import { defineNuxtConfig } from 'nuxt/config'
import type { NuxtPage } from 'nuxt/schema'

const here = (path: string) => fileURLToPath(new URL(path, import.meta.url))
const pagesDir = `${here('./app/pages').replaceAll('\\', '/')}/`

// Workspace URLs have no language prefix (/login, /organizations/...): the language comes from the
// user's preference, not the address. @nuxtjs/i18n reads `meta.i18n` after this hook, so one flag
// here replaces a `definePageMeta({ i18n: false })` in every page.
const keepUnprefixed = (pages: NuxtPage[]): void => {
  for (const page of pages) {
    if (page.file?.replaceAll('\\', '/').startsWith(pagesDir)) {
      page.meta = { ...page.meta, i18n: false }
    }
    keepUnprefixed(page.children ?? [])
  }
}

// The app's pages are private: kept out of search results and of the sitemap.
const privatePaths = [
  '/account',
  '/agent-sign-in',
  '/dev/**',
  '/join/**',
  '/login',
  '/organizations',
  '/organizations/**',
  '/payment/**',
]

// The working application: sign-in, organizations, issues, boards, billing and retro.
export default defineNuxtConfig({
  css: [
    here('./app/assets/css/pages.css'),
    here('./app/assets/css/markdown.css'),
    here('./app/assets/css/tours.css'),
  ],
  hooks: {
    'pages:extend': keepUnprefixed,
  },
  routeRules: Object.fromEntries(
    privatePaths.map((path) => [path, { headers: { 'X-Robots-Tag': 'noindex, nofollow' } }]),
  ),
  sitemap: { exclude: privatePaths },
})
