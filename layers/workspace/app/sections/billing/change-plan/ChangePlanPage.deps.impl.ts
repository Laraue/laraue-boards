import type { components } from '#infrastructure/api/billing.generated'
import type { ApiClient, BillingApiClient } from '#infrastructure/api/client'
import { request } from '#infrastructure/api/request'

import type { BillingPlanViewModel, ChangePlanPageDeps } from './ChangePlanPage.deps'

type Schemas = components['schemas']
type PersonalTariff = Schemas['PersonalSubscriptionLaraueBoardsPersonalSubscription']

const isBoardsTariff = (tariff: Schemas['PersonalSubscription']): tariff is PersonalTariff =>
  tariff.type !== 'MarkdownTranslatorPersonal'

const mapPlan = (tariff: PersonalTariff | Schemas['TeamSubscription']): BillingPlanViewModel => ({
  currencyCode: tariff.currencyCode,
  formattedPrice: tariff.formattedPrice,
  id: tariff.id,
  isFree: Number(tariff.price ?? 0) === 0,
  issuesPerMonth: Number(tariff.limitIssuesPerMonth ?? 0) || undefined,
  title: tariff.title,
  tokens: Number(tariff.includedTokensCount),
})

export const createChangePlanPageDeps = (
  client: ApiClient,
  billingClient: BillingApiClient,
): ChangePlanPageDeps => ({
  getPlans: async ({ signal }) => {
    const tariffs = await request(
      billingClient.GET('/api/tariffs', {
        params: { query: { ServiceId: 'LaraueBoards' } },
        signal,
      }),
    )

    return {
      personal: tariffs.personalSubscriptions.filter(isBoardsTariff).map(mapPlan),
      team: tariffs.teamSubscriptions.map(mapPlan),
    }
  },
  startCheckout: async ({ currencyCode, itemId, kind }) => {
    const checkout = await request(
      client.POST('/api/billing/checkout', { body: { currencyCode, itemId, kind } }),
    )

    return { url: checkout.url }
  },
  view: async ({ signal }) => {
    const summary = await request(client.GET('/api/billing/summary', { signal }))

    return {
      canPay: summary.canPay,
      kind: summary.$type === 'personal' ? 'personal' : 'team',
      subscriptionCode: summary.subscriptionCode,
    }
  },
})
