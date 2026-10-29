import { assert, expect, test } from 'vitest'

import { createTestApiClient, createTestBillingApiClient } from '#infrastructure/api/testApiClient'

import { createTokenPacksPageDeps } from './TokenPacksPage.deps.impl'

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

  await createTokenPacksPageDeps(createTestApiClient().client, client).getTokenPacks({})

  const url = new URL(requests[0]!.url)
  assert.equal(url.pathname, '/api/token-packs')
  assert.equal(url.searchParams.has('CurrencyCode'), false)
})

test('maps the packs to the view model', async () => {
  const { client } = createTestBillingApiClient(() => ({
    tokenPacks: [
      small,
      { ...small, expirationPeriod: 'Forever', id: 'forever-id', title: 'Forever' },
    ],
  }))

  const deps = createTokenPacksPageDeps(createTestApiClient().client, client)

  assert.deepEqual(await deps.getTokenPacks({}), [
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

  const deps = createTokenPacksPageDeps(createTestApiClient().client, client)

  await expect(deps.getTokenPacks({})).rejects.toMatchObject({ status: 503 })
})

test('starts a token pack checkout and returns the payment address', async () => {
  const { client, requests } = createTestApiClient(() => ({
    paymentId: 'payment-id',
    url: 'https://pay.example/checkout',
  }))

  const deps = createTokenPacksPageDeps(client, createTestBillingApiClient().client)
  const checkout = await deps.startCheckout({
    currencyCode: 'RUB',
    itemId: 'small-id',
    kind: 'TokenPack',
  })

  assert.equal(checkout.url, 'https://pay.example/checkout')
  assert.deepEqual(await requests[0]!.json(), {
    currencyCode: 'RUB',
    itemId: 'small-id',
    kind: 'TokenPack',
  })
})

test('maps only payment permission from the summary', async () => {
  const { client } = createTestApiClient(() => ({ canPay: false }))
  const deps = createTokenPacksPageDeps(client, createTestBillingApiClient().client)

  assert.deepEqual(await deps.view({}), { canPay: false })
})

test('preserves cancellation of a Billing request', async () => {
  const controller = new AbortController()
  const { client } = createTestApiClient()
  const { client: billingClient, requests } = createTestBillingApiClient((request) => {
    assert.isTrue(request.signal.aborted)
    throw new DOMException('Cancelled', 'AbortError')
  })
  controller.abort()

  const deps = createTokenPacksPageDeps(client, billingClient)
  await expect(deps.getTokenPacks({ signal: controller.signal })).rejects.toMatchObject({
    name: 'AbortError',
  })
  assert.lengthOf(requests, 1)
})
