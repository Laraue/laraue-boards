import { expect, test } from 'vitest'

import { getLandingOffers } from './getLandingOffers'
import type { LandingOfferKey } from './getLandingOffers'
import type { LandingTariff } from './LandingPage.deps'

// Stands in for the page's translations: the key and its count.
const t = (key: LandingOfferKey, params?: Readonly<Record<string, number | string>>) =>
  params ? `${key}(${String(params['count'])})` : key

const free: LandingTariff = {
  billing: { duration: 0, period: 'forever' },
  currencyCode: 'USD',
  formattedPrice: '$0',
  id: 'free',
  issuesPerMonth: 100,
  price: 0,
  title: 'Free',
  tokens: 50,
}

test('builds offers without mounting the pricing component and clears them when tariffs disappear', () => {
  const offers = getLandingOffers(
    { personal: [free], team: [free] },
    { locale: 'en', pricingUrl: 'https://example.com/#pricing', t },
  )

  expect(offers.map((offer) => offer.name)).toEqual(['Free — personal_label', 'Free — team_label'])
  expect(offers[0]?.description).toContain('offer_tokens_monthly(50)')
  expect(offers[1]?.description).toContain('offer_tokens_monthly_org(50)')
  expect(offers[0]?.url).toMatch(/\/#pricing$/)

  expect(
    getLandingOffers(undefined, { locale: 'en', pricingUrl: 'https://example.com/#pricing', t }),
  ).toEqual([])
})

test('describes paid team offers per seat', () => {
  const offers = getLandingOffers(
    {
      personal: [],
      team: [{ ...free, billing: { duration: 1, period: 'month' }, price: 10 }],
    },
    { locale: 'ru', pricingUrl: 'https://example.com/ru#pricing', t },
  )

  expect(offers[0]?.name).toBe('Free — team_label')
  expect(offers[0]?.description).toContain('offer_tokens_per_seat(50)')
  expect(offers[0]?.url).toMatch(/\/ru#pricing$/)
})
