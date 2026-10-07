import type { ApiClient } from '#infrastructure/api/client'
import type { components } from '#infrastructure/api/generated'
import { ApiError, request } from '#infrastructure/api/request'

import type { LandingTariff } from '../landing/LandingPage.deps'
import type { TariffsFetcher } from '../landing/LandingPage.deps.impl'
import { createLandingPageDeps } from '../landing/LandingPage.deps.impl'
import type {
  BillingPageDeps,
  BillingPlanViewModel,
  BillingTokenPackViewModel,
  BillingUsageViewModel,
} from './BillingPage.deps'

type Schemas = components['schemas']

const mapUsage = (usage: null | Schemas['LimitUsage'] | undefined): BillingUsageViewModel | null =>
  usage
    ? {
        limit: Number(usage.limit),
        remaining: Number(usage.remaining),
        used: Number(usage.used),
      }
    : null

const mapPlans = (tariffs: LandingTariff[]): BillingPlanViewModel[] =>
  tariffs.map((tariff) => ({
    currencyCode: tariff.currencyCode,
    formattedPrice: tariff.formattedPrice,
    id: tariff.id,
    isFree: tariff.price === 0,
    issuesPerMonth: tariff.issuesPerMonth,
    title: tariff.title,
    tokens: tariff.tokens,
  }))

export const createBillingPageDeps = (
  client: ApiClient,
  tariffsFetcher: TariffsFetcher,
): BillingPageDeps => ({
  // The prices come from the same route as the landing page's, so Billing stays server-side only. They
  // are already in the currency Billing charges in.
  getPlans: async () => {
    const tariffs = await createLandingPageDeps(tariffsFetcher).getTariffs()

    return { personal: mapPlans(tariffs.personal), team: mapPlans(tariffs.team) }
  },
  // The packs come from this app's own route too (see `server/routes/landing`).
  getTokenPacks: async () => {
    try {
      return (await tariffsFetcher('/landing/token-packs')) as BillingTokenPackViewModel[]
    } catch (cause) {
      throw new ApiError((cause as { statusCode?: number }).statusCode ?? 0)
    }
  },
  startCheckout: async ({ currencyCode, itemId, kind }) => {
    const checkout = await request(
      client.POST('/api/billing/checkout', {
        body: { currencyCode, itemId, kind },
      }),
    )

    return { url: checkout.url }
  },
  view: async ({ signal }) => {
    const summary = await request(client.GET('/api/billing/summary', { signal }))
    const common = {
      canPay: summary.canPay,
      issuesPerMonth: mapUsage(summary.issuesPerMonth),
      periodEndsAt: summary.periodEndsAt ?? null,
      periodResets: summary.periodResets ?? false,
      purchasedTokens: {
        count: Number(summary.purchasedTokensCount ?? 0),
        expireAt: summary.purchasedTokensExpireAt ?? null,
        expiringCount: Number(summary.purchasedTokensExpiringCount ?? 0),
      },
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
