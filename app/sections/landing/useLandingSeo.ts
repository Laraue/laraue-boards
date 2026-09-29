import type { Locale } from '~/composables/useI18n'

import { githubUrl } from './landingLinks'

type Offer = Record<string, unknown>

const ogImagesBaseUrl = 'https://laraue.com/static/images/'

// The prices shown in the pricing section, set by it as schema.org offers.
export const useLandingOffers = () => useState<Offer[]>('landing-offers', () => [])

// Everything a search engine or a link preview needs from the landing page: meta tags, canonical and
// hreflang links, and structured data (the FAQ adds its own, see `LandingFaq`). The language comes
// from the route (see `useI18n`'s locale override).
export const useLandingSeo = (
  locale: Locale,
  { description, title }: { description: string; title: string },
): void => {
  const siteUrl = useSiteConfig().url.replace(/\/$/, '')
  const pageUrls: Record<Locale, string> = { en: `${siteUrl}/`, ru: `${siteUrl}/ru` }
  const pageUrl = pageUrls[locale]
  const ogImage = `${ogImagesBaseUrl}boards-og${locale === 'ru' ? '-ru' : ''}.png`
  const offers = useLandingOffers()

  useHead(() => ({
    htmlAttrs: { lang: locale },
    link: [
      { href: pageUrl, rel: 'canonical' },
      { href: pageUrls.en, hreflang: 'en', rel: 'alternate' },
      { href: pageUrls.ru, hreflang: 'ru', rel: 'alternate' },
      { href: pageUrls.en, hreflang: 'x-default', rel: 'alternate' },
    ],
    script: [
      {
        // `<` is escaped so no text in the data can close the script element.
        innerHTML: JSON.stringify({
          '@context': 'https://schema.org',
          '@graph': [
            {
              '@id': `${siteUrl}/#organization`,
              '@type': 'Organization',
              logo: laraueLogoUrl,
              name: 'Laraue Software',
              sameAs: [githubUrl],
              url: 'https://laraue.com',
            },
            {
              '@id': `${siteUrl}/#website`,
              '@type': 'WebSite',
              inLanguage: locale,
              name: 'Laraue Boards',
              publisher: { '@id': `${siteUrl}/#organization` },
              url: pageUrl,
            },
            {
              '@type': 'SoftwareApplication',
              applicationCategory: 'BusinessApplication',
              description,
              image: ogImage,
              inLanguage: locale,
              name: 'Laraue Boards',
              offers:
                offers.value.length > 0
                  ? offers.value
                  : [{ '@type': 'Offer', price: 0, priceCurrency: 'USD' }],
              operatingSystem: 'Web, Telegram',
              publisher: { '@id': `${siteUrl}/#organization` },
              url: pageUrl,
            },
          ],
        }).replaceAll('<', String.raw`\u003c`),
        key: 'landing-jsonld',
        type: 'application/ld+json',
      },
    ],
    titleTemplate: (pageTitle) => pageTitle ?? '',
  }))

  useSeoMeta({
    description,
    ogDescription: description,
    ogImage,
    ogImageAlt: title,
    ogImageHeight: '630',
    ogImageType: 'image/png',
    ogImageWidth: '1200',
    ogLocale: locale === 'ru' ? 'ru_RU' : 'en_US',
    ogLocaleAlternate: locale === 'ru' ? ['en_US'] : ['ru_RU'],
    ogSiteName: 'Laraue Boards',
    ogTitle: title,
    ogType: 'website',
    ogUrl: pageUrl,
    robots: 'index, follow, max-image-preview:large',
    title,
    twitterCard: 'summary_large_image',
    twitterDescription: description,
    twitterImage: ogImage,
    twitterImageAlt: title,
    twitterTitle: title,
  })
}
