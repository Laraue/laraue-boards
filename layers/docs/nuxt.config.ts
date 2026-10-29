import { fileURLToPath } from 'node:url'

import { defineNuxtConfig } from 'nuxt/config'

const here = (path: string) => fileURLToPath(new URL(path, import.meta.url))

// The documentation: its pages, the server that renders the markdown, and the contracts between them.
export default defineNuxtConfig({
  // The articles (`content/`) are bundled with the server and read by `server/docs/useDocsCatalog`.
  nitro: {
    serverAssets: [{ baseName: 'docs', dir: here('./content') }],
  },
  routeRules: {
    '/en/documentation': { redirect: { statusCode: 301, to: '/documentation' } },
    '/en/documentation/**': { redirect: { statusCode: 301, to: '/documentation/**' } },
    // Data for the pages and the sitemap, not pages themselves.
    '/docs-content/**': { headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
    '/docs-sitemap-urls': { headers: { 'X-Robots-Tag': 'noindex, nofollow' } },
  },
  // The articles share one route, so their addresses come from the markdown files.
  sitemap: { sources: ['/docs-sitemap-urls'] },
})
