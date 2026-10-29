import { defineSitemapEventHandler } from '#sitemap/server/composables/defineSitemapEventHandler'

import { useDocsCatalog } from '../docs/useDocsCatalog'

const locales = ['en', 'ru'] as const
const docsPath = (locale: string, path: string[]): string =>
  [locale === 'en' ? '' : `/${locale}`, 'documentation', ...path].join('/')

// The docs pages for the sitemap (see `sitemap.sources` in nuxt.config). Every page exists in both
// languages (see content.test), so each one links to both.
export default defineSitemapEventHandler(async () => {
  const catalog = await useDocsCatalog()

  return locales.flatMap((locale) =>
    catalog.pages(locale).map(({ path, updatedAt }) => ({
      alternatives: [
        ...locales.map((other) => ({ href: docsPath(other, path), hreflang: other })),
        { href: docsPath('en', path), hreflang: 'x-default' },
      ],
      lastmod: updatedAt,
      loc: docsPath(locale, path),
    })),
  )
})
