import { docsPath } from '../../app/sections/docs/docsPaths'

// The docs pages for the sitemap (see `sitemap.sources` in nuxt.config): each one with its address
// in the other language, when it has one.
export default defineSitemapEventHandler(async () => {
  const catalog = await useDocsCatalog()
  const pages = {
    en: new Map(catalog.pages('en').map((page) => [page.path.join('/'), page])),
    ru: new Map(catalog.pages('ru').map((page) => [page.path.join('/'), page])),
  }

  return (['en', 'ru'] as const).flatMap((locale) =>
    [...pages[locale].values()].map(({ path, updatedAt }) => {
      const alternatives = (['en', 'ru'] as const)
        .filter((other) => pages[other].has(path.join('/')))
        .map((other) => ({ href: docsPath(other, path), hreflang: other }))
      const primary = alternatives.find((alternative) => alternative.hreflang === 'en')

      return {
        alternatives: primary
          ? [...alternatives, { href: primary.href, hreflang: 'x-default' }]
          : alternatives,
        lastmod: updatedAt,
        loc: docsPath(locale, path),
      }
    }),
  )
})
