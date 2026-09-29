import type { Locale } from '~/composables/useI18n'

import type { DocPage } from './content/DocsContent.types'
import { docsPath } from './docsPaths'

const productName = 'Laraue Boards'

const docsLabel: Record<Locale, string> = { en: 'Documentation', ru: 'Документация' }

export type DocsSeo = {
  alternates: { href: string; hreflang: string }[]
  canonical: string
  description: string
  keywords: string[]
  structuredData: Record<string, unknown>
  title: string
}

// Addresses, alternates and structured data of a docs page. `siteUrl` has no trailing slash.
export const buildDocsSeo = ({
  locale,
  logoUrl,
  ogImage,
  page,
  path,
  siteUrl,
}: {
  locale: Locale
  logoUrl: string
  ogImage: string
  page: DocPage
  path: string[]
  siteUrl: string
}): DocsSeo => {
  const canonical = `${siteUrl}${docsPath(locale, path)}`
  const organizationId = `${siteUrl}/#organization`

  // Every language the page exists in, and English (or the only language) for everyone else.
  const alternates: DocsSeo['alternates'] = page.alternates.map((language) => ({
    href: `${siteUrl}${docsPath(language, path)}`,
    hreflang: language,
  }))
  const fallback = page.alternates.includes('en') ? 'en' : page.alternates[0]
  if (fallback) {
    alternates.push({ href: `${siteUrl}${docsPath(fallback, path)}`, hreflang: 'x-default' })
  }

  // Product > Documentation > sections > the page. The first breadcrumb of the page is the docs'
  // home page, which is the "Documentation" step here.
  const breadcrumbs = [
    { item: `${siteUrl}${locale === 'ru' ? '/ru' : '/'}`, name: productName },
    { item: `${siteUrl}${docsPath(locale)}`, name: docsLabel[locale] },
    ...page.breadcrumbs.slice(1).map((crumb) => ({
      item: `${siteUrl}${docsPath(locale, crumb.path)}`,
      name: crumb.title,
    })),
  ]

  const { createdAt, description, keywords, kind, title, updatedAt } = page.meta

  return {
    alternates,
    canonical,
    description,
    keywords,
    structuredData: {
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@id': organizationId,
          '@type': 'Organization',
          logo: logoUrl,
          name: 'Laraue Software',
          url: 'https://laraue.com',
        },
        kind === 'page'
          ? {
              '@id': `${canonical}#article`,
              '@type': 'TechArticle',
              author: { '@id': organizationId },
              dateModified: updatedAt,
              datePublished: createdAt,
              description,
              headline: title,
              image: ogImage,
              inLanguage: locale,
              keywords: keywords.join(', '),
              mainEntityOfPage: canonical,
              publisher: { '@id': organizationId },
            }
          : {
              '@id': `${canonical}#page`,
              '@type': 'CollectionPage',
              dateModified: updatedAt,
              description,
              inLanguage: locale,
              name: title,
              publisher: { '@id': organizationId },
              url: canonical,
            },
        {
          '@type': 'BreadcrumbList',
          itemListElement: breadcrumbs.map((crumb, index) => ({
            '@type': 'ListItem',
            item: crumb.item,
            name: crumb.name,
            position: index + 1,
          })),
        },
      ],
    },
    title,
  }
}
