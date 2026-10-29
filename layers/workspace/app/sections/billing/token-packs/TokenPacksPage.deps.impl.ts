import type { components } from '#infrastructure/api/billing.generated'
import type { ApiClient, BillingApiClient } from '#infrastructure/api/client'
import { request } from '#infrastructure/api/request'

import type { BillingTokenPackViewModel, TokenPacksPageDeps } from './TokenPacksPage.deps'

type TokenPack = components['schemas']['TokenPack']

// The API sends 64-bit and floating point numbers as `number | string`.
const toNumber = (value: null | number | string | undefined): number => Number(value ?? 0)

const mapTokenPack = (pack: TokenPack): BillingTokenPackViewModel => ({
  currencyCode: pack.currencyCode,
  expirationMonths: pack.expirationPeriod === 'Month' ? toNumber(pack.expirationDuration) : null,
  formattedPrice: pack.formattedPrice,
  id: pack.id,
  title: pack.title,
  tokens: toNumber(pack.tokensCount),
})

export const createTokenPacksPageDeps = (
  client: ApiClient,
  billingClient: BillingApiClient,
): TokenPacksPageDeps => ({
  getTokenPacks: async ({ signal }) => {
    const data = await request(billingClient.GET('/api/token-packs', { signal }))

    return data.tokenPacks.map(mapTokenPack)
  },
  startCheckout: async ({ currencyCode, itemId, kind }) => {
    const checkout = await request(
      client.POST('/api/billing/checkout', { body: { currencyCode, itemId, kind } }),
    )

    return { url: checkout.url }
  },
  view: async ({ signal }) => {
    const summary = await request(client.GET('/api/billing/summary', { signal }))

    return { canPay: summary.canPay }
  },
})
