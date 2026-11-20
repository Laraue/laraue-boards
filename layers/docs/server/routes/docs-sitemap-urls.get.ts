import { defineSitemapEventHandler } from '#sitemap/server/composables/defineSitemapEventHandler'

import { docsPagePath } from '../docs/docsMarkdown'
import { useDocsCatalog } from '../docs/useDocsCatalog'

const locales = ['en', 'ru'] as const

// The docs pages for the sitemap (see `sitemap.sources` in nuxt.config). Every page exists in both
// languages (see content.test), so each one links to both.
export default defineSitemapEventHandler(async () => {
  const catalog = await useDocsCatalog()

  return locales.flatMap((locale) =>
    catalog.pages(locale).map(({ path, updatedAt }) => ({
      alternatives: [
        ...locales.map((other) => ({ href: docsPagePath(other, path), hreflang: other })),
        { href: docsPagePath('en', path), hreflang: 'x-default' },
      ],
      lastmod: updatedAt,
      loc: docsPagePath(locale, path),
    })),
  )
})
