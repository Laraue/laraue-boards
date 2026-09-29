import type { Locale } from '~/composables/useI18n'

import type { DocPage } from './content/DocsContent.types'
import { buildDocsSeo } from './docsSeo'

const ogImagesBaseUrl = 'https://laraue.com/static/images/'

// Meta tags, canonical and hreflang links and structured data of a docs page (see `buildDocsSeo`).
export const useDocsSeo = (locale: Locale, path: string[], page: DocPage): void => {
  const ogImage = `${ogImagesBaseUrl}boards-og${locale === 'ru' ? '-ru' : ''}.png`
  const seo = buildDocsSeo({
    locale,
    logoUrl: laraueLogoUrl,
    ogImage,
    page,
    path,
    siteUrl: useSiteConfig().url.replace(/\/$/, ''),
  })

  useHead({
    htmlAttrs: { lang: locale },
    link: [
      { href: seo.canonical, rel: 'canonical' },
      ...seo.alternates.map((alternate) => ({ ...alternate, rel: 'alternate' as const })),
    ],
    meta: [{ content: seo.keywords.join(', '), name: 'keywords' }],
    script: [
      {
        // `<` is escaped so no text in the data can close the script element.
        innerHTML: JSON.stringify(seo.structuredData).replaceAll('<', String.raw`<`),
        key: 'docs-jsonld',
        type: 'application/ld+json',
      },
    ],
  })

  useSeoMeta({
    articleModifiedTime: page.meta.updatedAt,
    articlePublishedTime: page.meta.createdAt,
    description: seo.description,
    ogDescription: seo.description,
    ogImage,
    ogImageAlt: seo.title,
    ogImageHeight: '630',
    ogImageType: 'image/png',
    ogImageWidth: '1200',
    ogLocale: locale === 'ru' ? 'ru_RU' : 'en_US',
    ogSiteName: 'Laraue Boards',
    ogTitle: seo.title,
    ogType: page.meta.kind === 'page' ? 'article' : 'website',
    ogUrl: seo.canonical,
    robots: 'index, follow, max-image-preview:large',
    title: seo.title,
    twitterCard: 'summary_large_image',
    twitterDescription: seo.description,
    twitterImage: ogImage,
    twitterTitle: seo.title,
  })
}
