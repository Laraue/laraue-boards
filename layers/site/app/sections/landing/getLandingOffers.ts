import type { Locale } from '#layers/core/app/i18n/translator'

import type { LandingTariff, LandingTariffs } from './LandingPage.deps'

const isFreeTariff = (tariff: LandingTariff): boolean => tariff.billing.period === 'forever'

// The texts of the offers; they are translations of the landing page.
export type LandingOfferKey =
  | 'offer_free_orgs'
  | 'offer_issues'
  | 'offer_issues_org'
  | 'offer_tokens'
  | 'offer_tokens_monthly'
  | 'offer_tokens_monthly_org'
  | 'offer_tokens_per_seat'
  | 'offer_unlimited_orgs'
  | 'personal_label'
  | 'team_label'

export const getLandingOffers = (
  tariffs: LandingTariffs | undefined,
  {
    locale,
    pricingUrl,
    t,
  }: {
    locale: Locale
    pricingUrl: string
    t: (key: LandingOfferKey, params?: Readonly<Record<string, number | string>>) => string
  },
) => {
  const tokensOffer = (tariff: LandingTariff, perSeat: boolean): string => {
    const count = tariff.tokens.toLocaleString(locale)
    if (isFreeTariff(tariff)) {
      return t(perSeat ? 'offer_tokens_monthly_org' : 'offer_tokens_monthly', { count })
    }
    return t(perSeat ? 'offer_tokens_per_seat' : 'offer_tokens', { count })
  }

  const offerDescription = (tariff: LandingTariff, perSeat: boolean): string | undefined =>
    [
      tariff.tokens > 0 ? tokensOffer(tariff, perSeat) : '',
      tariff.issuesPerMonth
        ? t(perSeat ? 'offer_issues_org' : 'offer_issues', {
            count: tariff.issuesPerMonth.toLocaleString(locale),
          })
        : '',
      !perSeat && tariff.freeOrganizations === null ? t('offer_unlimited_orgs') : '',
      !perSeat && tariff.freeOrganizations
        ? t('offer_free_orgs', { count: tariff.freeOrganizations })
        : '',
    ]
      .filter(Boolean)
      .join(', ') || undefined

  const value = tariffs
  if (!value) {
    return []
  }
  // Individual and team plans share names ("Free"), so the audience is part of the offer name.
  const toOffer = (tariff: LandingTariff, perSeat: boolean) => ({
    '@type': 'Offer',
    availability: 'https://schema.org/InStock',
    description: offerDescription(tariff, perSeat),
    name: `${tariff.title} — ${t(perSeat ? 'team_label' : 'personal_label')}`,
    price: tariff.price,
    priceCurrency: tariff.currencyCode,
    url: pricingUrl,
  })
  return [
    ...value.personal.map((tariff) => toOffer(tariff, false)),
    ...value.team.map((tariff) => toOffer(tariff, true)),
  ]
}
