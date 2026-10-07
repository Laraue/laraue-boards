import type { components } from '#infrastructure/api/billing.generated'
import type { BillingApiClient } from '#infrastructure/api/client'
import { request } from '#infrastructure/api/request'

import type { BillingTokenPackViewModel } from './BillingPage.deps'

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

// Billing's token packs for sale, read on the server by `server/routes/landing`. Billing prices them
// in the currency its payment provider charges in.
export const loadTokenPacks = async (
  client: BillingApiClient,
): Promise<BillingTokenPackViewModel[]> => {
  const data = await request(client.GET('/api/token-packs'))

  return data.tokenPacks.map(mapTokenPack)
}
