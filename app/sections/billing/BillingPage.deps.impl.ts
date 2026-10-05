import type { ApiClient } from '#infrastructure/api/client'
import type { components } from '#infrastructure/api/generated'
import { request } from '#infrastructure/api/request'

import type { LandingTariff } from '../landing/LandingPage.deps'
import type { TariffsFetcher } from '../landing/LandingPage.deps.impl'
import { createLandingPageDeps } from '../landing/LandingPage.deps.impl'
import type {
  BillingPageDeps,
  BillingPlanViewModel,
  BillingUsageViewModel,
} from './BillingPage.deps'

type Schemas = components['schemas']

// The only currency the payment provider charges in.
const PAYMENT_CURRENCY = 'RUB'

const mapUsage = (usage: null | Schemas['LimitUsage'] | undefined): BillingUsageViewModel | null =>
  usage
    ? {
        limit: Number(usage.limit),
        remaining: Number(usage.remaining),
        used: Number(usage.used),
      }
    : null

// Only paid plans can be bought.
const mapPlans = (tariffs: LandingTariff[]): BillingPlanViewModel[] =>
  tariffs
    .filter((tariff) => tariff.price > 0)
    .map((tariff) => ({
      currencyCode: tariff.currencyCode,
      formattedPrice: tariff.formattedPrice,
      id: tariff.id,
      issuesPerMonth: tariff.issuesPerMonth,
      title: tariff.title,
      tokens: tariff.tokens,
    }))

export const createBillingPageDeps = (
  client: ApiClient,
  tariffsFetcher: TariffsFetcher,
): BillingPageDeps => ({
  // The prices come from the same route as the landing page's, so Billing stays server-side only.
  getPlans: async () => {
    const tariffs = await createLandingPageDeps(tariffsFetcher).getTariffs(PAYMENT_CURRENCY)

    return { personal: mapPlans(tariffs.personal), team: mapPlans(tariffs.team) }
  },
  startCheckout: async ({ currencyCode, planId }) => {
    const checkout = await request(
      client.POST('/api/billing/checkout', {
        body: { currencyCode, itemId: planId, kind: 'Subscription' },
      }),
    )

    return { url: checkout.url }
  },
  view: async ({ signal }) => {
    const summary = await request(client.GET('/api/billing/summary', { signal }))
    const common = {
      canPay: summary.canPay,
      issuesPerMonth: mapUsage(summary.issuesPerMonth),
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
