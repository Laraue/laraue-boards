import { assert, expect, test } from 'vitest'

import { createTestApiClient, createTestBillingApiClient } from '#infrastructure/api/testApiClient'

import { createChangePlanPageDeps } from './ChangePlanPage.deps.impl'

const tariff = (overrides: Record<string, unknown> = {}) => ({
  currencyCode: 'RUB',
  formattedPrice: '334₽',
  id: 'tariff-id',
  includedStorageMegabytes: 1024,
  includedTokensCount: '300000',
  price: 334,
  storageAddonPrices: [],
  title: 'Plus',
  type: 'LaraueBoardsPersonal',
  ...overrides,
})

test('offers all plans, priced as Billing returns them', async () => {
  const { client } = createTestApiClient()
  const { client: billingClient, requests } = createTestBillingApiClient(() => ({
    personalSubscriptions: [
      tariff({ id: 'free-id', price: 0, title: 'Free' }),
      tariff({
        id: 'plus-id',
        limitIssuesPerMonth: 500,
        storageAddonPrices: [{ formattedPrice: '417₽', price: 417, storageAddonId: 'addon-10' }],
      }),
    ],
    storageAddons: [
      {
        currencyCode: 'RUB',
        formattedPrice: '84₽',
        id: 'addon-10',
        price: 84,
        storageMegabytes: 10240,
        title: '+10 GB',
      },
    ],
    teamSubscriptions: [tariff({ id: 'team-id', price: 500, title: 'Team' })],
  }))
  const deps = createChangePlanPageDeps(client, billingClient)

  const plans = await deps.getPlans({})

  const url = new URL(requests[0]!.url)
  assert.equal(url.pathname, '/api/tariffs')
  assert.equal(url.searchParams.get('ServiceId'), 'LaraueBoards')
  assert.isFalse(url.searchParams.has('CurrencyCode'))
  assert.deepEqual(
    plans.personal.map((plan) => [plan.id, plan.isFree]),
    [
      ['free-id', true],
      ['plus-id', false],
    ],
  )
  assert.deepEqual(plans.personal[1], {
    currencyCode: 'RUB',
    formattedPrice: '334₽',
    id: 'plus-id',
    isFree: false,
    issuesPerMonth: 500,
    storageAddonPrices: [{ addonId: 'addon-10', formattedPrice: '417₽' }],
    storageMegabytes: 1024,
    title: 'Plus',
    tokens: 300_000,
  })
  assert.deepEqual(plans.storageAddons, [
    { formattedPrice: '84₽', id: 'addon-10', storageMegabytes: 10_240, title: '+10 GB' },
  ])
  assert.deepEqual(
    plans.team.map((plan) => plan.id),
    ['team-id'],
  )
})

test('starts a subscription checkout and returns the payment address', async () => {
  const { client, requests } = createTestApiClient(() => ({
    paymentId: 'payment-id',
    storageOverLimit: null,
    url: 'https://pay.example/checkout',
  }))

  const deps = createChangePlanPageDeps(client, createTestBillingApiClient().client)
  const checkout = await deps.startCheckout({
    currencyCode: 'RUB',
    itemId: 'plus-id',
    kind: 'Subscription',
    storageAddonId: 'addon-10',
  })

  assert.deepEqual(checkout, { kind: 'payment', url: 'https://pay.example/checkout' })
  assert.equal(new URL(requests[0]!.url).pathname, '/api/billing/checkout')
  assert.deepEqual(await requests[0]!.json(), {
    currencyCode: 'RUB',
    itemId: 'plus-id',
    kind: 'Subscription',
    storageAddonId: 'addon-10',
  })
})

test('returns how much to delete when the checkout gives less storage than is used', async () => {
  const { client } = createTestApiClient(() => ({
    paymentId: null,
    storageOverLimit: { excessBytes: 476, quotaBytes: 1024, usedBytes: 1500 },
    url: null,
  }))

  const deps = createChangePlanPageDeps(client, createTestBillingApiClient().client)

  assert.deepEqual(
    await deps.startCheckout({
      currencyCode: 'RUB',
      itemId: 'plus-id',
      kind: 'Subscription',
      storageAddonId: null,
    }),
    { excessBytes: 476, kind: 'storageOverLimit', quotaBytes: 1024, usedBytes: 1500 },
  )
})

test('maps only the summary needed to choose a plan', async () => {
  const { client } = createTestApiClient(() => ({
    $type: 'personal',
    canPay: true,
    storage: { quotaBytes: 104_857_600, storageAddonId: 'addon-10', usedBytes: 2_000 },
    subscriptionCode: 'Free',
  }))
  const deps = createChangePlanPageDeps(client, createTestBillingApiClient().client)

  assert.deepEqual(await deps.view({}), {
    canPay: true,
    kind: 'personal',
    storageAddonId: 'addon-10',
    storageUsedBytes: 2_000,
    subscriptionCode: 'Free',
  })
})

test('filters other services and preserves failed Billing responses', async () => {
  const { client } = createTestApiClient()
  const { client: billingClient } = createTestBillingApiClient(() => ({
    personalSubscriptions: [tariff({ type: 'MarkdownTranslatorPersonal' })],
    storageAddons: [],
    teamSubscriptions: [],
  }))
  assert.deepEqual(await createChangePlanPageDeps(client, billingClient).getPlans({}), {
    personal: [],
    storageAddons: [],
    team: [],
  })

  const { client: unavailable } = createTestBillingApiClient(
    () => new Response(null, { status: 503 }),
  )
  await expect(createChangePlanPageDeps(client, unavailable).getPlans({})).rejects.toMatchObject({
    status: 503,
  })
})

test('preserves cancellation of a Billing request', async () => {
  const controller = new AbortController()
  const { client } = createTestApiClient()
  const { client: billingClient, requests } = createTestBillingApiClient((request) => {
    assert.isTrue(request.signal.aborted)
    throw new DOMException('Cancelled', 'AbortError')
  })
  controller.abort()

  const deps = createChangePlanPageDeps(client, billingClient)
  await expect(deps.getPlans({ signal: controller.signal })).rejects.toMatchObject({
    name: 'AbortError',
  })
  assert.lengthOf(requests, 1)
})
