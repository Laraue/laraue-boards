import { assert, expect, test } from 'vitest'

import { createTestBillingApiClient } from '#infrastructure/api/testApiClient'

import { loadTokenPacks } from './tokenPacks'

const small = {
  code: 'small',
  currencyCode: 'RUB',
  expirationDuration: 6,
  expirationPeriod: 'Month',
  formattedPrice: '250₽',
  id: 'small-id',
  price: 250,
  title: 'Small',
  tokensCount: '100000',
}

test('requests the token packs without choosing a currency', async () => {
  const { client, requests } = createTestBillingApiClient(() => ({ tokenPacks: [] }))

  await loadTokenPacks(client)

  const url = new URL(requests[0]!.url)
  assert.equal(url.pathname, '/api/token-packs')
  assert.equal(url.searchParams.has('CurrencyCode'), false)
})

test('maps the packs to the view model', async () => {
  const { client } = createTestBillingApiClient(() => ({
    tokenPacks: [small, { ...small, expirationPeriod: 'Forever', id: 'forever-id', title: 'Forever' }],
  }))

  assert.deepEqual(await loadTokenPacks(client), [
    {
      currencyCode: 'RUB',
      expirationMonths: 6,
      formattedPrice: '250₽',
      id: 'small-id',
      title: 'Small',
      tokens: 100_000,
    },
    {
      currencyCode: 'RUB',
      expirationMonths: null,
      formattedPrice: '250₽',
      id: 'forever-id',
      title: 'Forever',
      tokens: 100_000,
    },
  ])
})

test('reports a failed Billing request', async () => {
  const { client } = createTestBillingApiClient(() => new Response(null, { status: 503 }))

  await expect(loadTokenPacks(client)).rejects.toMatchObject({ status: 503 })
})
