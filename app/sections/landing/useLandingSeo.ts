import type { LandingLocale } from './LandingPage.messages'
import type { LandingTariff, LandingTariffs } from './LandingPage.types'
import type { LandingText } from './useLandingText'

type FaqItem = { answer: string; question: string }

const ogImagesBaseUrl = 'https://laraue.com/static/images/'
const githubUrl = 'https://github.com/win7user10/Laraue.Apps.Boards'

// Everything a search engine or a link preview needs from the landing page: meta tags, canonical and
// hreflang links, and structured data. The language comes from the route, see `useLandingText`.
export const useLandingSeo = (
  locale: LandingLocale,
  t: LandingText,
  faqItems: readonly FaqItem[],
  tariffs: LandingTariffs | undefined,
): void => {
  const siteUrl = useSiteConfig().url.replace(/\/$/, '')
  const pageUrls: Record<LandingLocale, string> = { en: `${siteUrl}/`, ru: `${siteUrl}/ru` }
  const pageUrl = pageUrls[locale]
  const ogImage = `${ogImagesBaseUrl}boards-og${locale === 'ru' ? '-ru' : ''}.png`
  const title = t('seoTitle')
  const description = t('seoDescription')

  const toOffer = (tariff: LandingTariff, perSeat: boolean) => ({
    '@type': 'Offer',
    description:
      [
        tariff.tokens > 0
          ? t(perSeat ? 'offer_tokens_per_seat' : 'offer_tokens', {
              count: tariff.tokens.toLocaleString(locale),
            })
          : '',
        tariff.issuesPerMonth
          ? t(perSeat ? 'offer_issues_org' : 'offer_issues', {
              count: tariff.issuesPerMonth.toLocaleString(locale),
            })
          : '',
        !perSeat && tariff.freeOrganizations
          ? t('offer_free_orgs', { count: tariff.freeOrganizations })
          : '',
      ]
        .filter(Boolean)
        .join(', ') || undefined,
    name: tariff.title,
    price: tariff.price,
    priceCurrency: tariff.currencyCode,
  })

  const offers = tariffs
    ? [
        ...tariffs.personal.map((tariff) => toOffer(tariff, false)),
        ...tariffs.team.map((tariff) => toOffer(tariff, true)),
      ]
    : [{ '@type': 'Offer', price: 0, priceCurrency: 'USD' }]

  const structuredData = {
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
        offers,
        operatingSystem: 'Web, Telegram',
        publisher: { '@id': `${siteUrl}/#organization` },
        url: pageUrl,
      },
      {
        '@type': 'FAQPage',
        inLanguage: locale,
        mainEntity: faqItems.map((item) => ({
          '@type': 'Question',
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
          name: item.question,
        })),
      },
    ],
  }

  useHead({
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
        innerHTML: JSON.stringify(structuredData).replaceAll('<', String.raw`<`),
        type: 'application/ld+json',
      },
    ],
    titleTemplate: (pageTitle) => pageTitle ?? '',
  })

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
