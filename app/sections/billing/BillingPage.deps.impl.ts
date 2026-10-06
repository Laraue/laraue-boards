import type { ApiClient } from '#infrastructure/api/client'
import type { components } from '#infrastructure/api/generated'
import { request } from '#infrastructure/api/request'

import type { LandingCurrency, LandingTariff } from '../landing/LandingPage.deps'
import type { TariffsFetcher } from '../landing/LandingPage.deps.impl'
import { createLandingPageDeps } from '../landing/LandingPage.deps.impl'
import type {
  BillingPageDeps,
  BillingPlanViewModel,
  BillingUsageViewModel,
} from './BillingPage.deps'

type Schemas = components['schemas']

// Prices in this currency are shown next to the payment currency's, so the amount is easy to grasp.
const REFERENCE_CURRENCY: LandingCurrency = 'USD'

const isLandingCurrency = (code: string): code is LandingCurrency =>
  code === 'RUB' || code === 'USD'

const mapUsage = (usage: null | Schemas['LimitUsage'] | undefined): BillingUsageViewModel | null =>
  usage
    ? {
        limit: Number(usage.limit),
        remaining: Number(usage.remaining),
        used: Number(usage.used),
      }
    : null

const mapPlans = (
  tariffs: LandingTariff[],
  referenceTariffs: LandingTariff[],
): BillingPlanViewModel[] =>
  tariffs.map((tariff) => ({
    currencyCode: tariff.currencyCode,
    formattedPrice: tariff.formattedPrice,
    id: tariff.id,
    isFree: tariff.price === 0,
    issuesPerMonth: tariff.issuesPerMonth,
    // A free plan needs no hint.
    referencePrice:
      tariff.price === 0
        ? undefined
        : referenceTariffs.find((reference) => reference.id === tariff.id)?.formattedPrice,
    title: tariff.title,
    tokens: tariff.tokens,
  }))

export const createBillingPageDeps = (
  client: ApiClient,
  tariffsFetcher: TariffsFetcher,
): BillingPageDeps => ({
  // The prices come from the same route as the landing page's, so Billing stays server-side only.
  getPlans: async ({ currencyCode }) => {
    if (!isLandingCurrency(currencyCode)) {
      throw new Error(`Prices in ${currencyCode} are not available`)
    }
    const landing = createLandingPageDeps(tariffsFetcher)
    const tariffs = await landing.getTariffs(currencyCode)
    // The reference prices only help to grasp the amount: without them the plans are still shown.
    const reference =
      currencyCode === REFERENCE_CURRENCY
        ? undefined
        : await landing.getTariffs(REFERENCE_CURRENCY).catch(() => undefined)

    return {
      personal: mapPlans(tariffs.personal, reference?.personal ?? []),
      team: mapPlans(tariffs.team, reference?.team ?? []),
    }
  },
  startCheckout: async ({ planId }) => {
    const checkout = await request(
      client.POST('/api/billing/checkout', {
        body: { itemId: planId, kind: 'Subscription' },
      }),
    )

    return { url: checkout.url }
  },
  view: async ({ signal }) => {
    const summary = await request(client.GET('/api/billing/summary', { signal }))
    const common = {
      canPay: summary.canPay,
      issuesPerMonth: mapUsage(summary.issuesPerMonth),
      paymentCurrencyCode: summary.paymentCurrencyCode,
      subscriptionCode: summary.subscriptionCode,
      tokens: mapUsage(summary.tokens)!,
    }
    if (summary.$type === 'personal') {
      return {
        ...common,
        freeTeamOrganizations: mapUsage(summary.freeTeamOrganizations),
        kind: 'personal',
      }
    }
    return { ...common, kind: 'team' }
  },
})
