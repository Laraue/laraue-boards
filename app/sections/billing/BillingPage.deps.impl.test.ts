import { assert, expect, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import type { LandingTariff } from '../landing/LandingPage.deps'
import { createBillingPageDeps } from './BillingPage.deps.impl'

const tariff = (overrides: Partial<LandingTariff>): LandingTariff => ({
  billing: { duration: 1, period: 'month' },
  currencyCode: 'RUB',
  formattedPrice: '334₽',
  id: 'tariff-id',
  price: 334,
  title: 'Plus',
  tokens: 300_000,
  ...overrides,
})

const noTariffs = async () => ({ personal: [], team: [] })

test('maps the billing summary and its nullable limits', async () => {
  const { client } = createTestApiClient(() => ({
    $type: 'personal',
    canPay: true,
    freeTeamOrganizations: { limit: '2', remaining: '1', used: '1' },
    issuesPerMonth: null,
    subscriptionCode: 'Pro',
    tokens: { limit: '1000', remaining: '850', used: '150' },
  }))

  assert.deepEqual(await createBillingPageDeps(client, noTariffs).view({}), {
    canPay: true,
    freeTeamOrganizations: { limit: 2, remaining: 1, used: 1 },
    issuesPerMonth: null,
    issuesResetAt: null,
    kind: 'personal',
    periodEndsAt: null,
    periodResets: false,
    purchasedTokens: { count: 0, expireAt: null, expiringCount: 0 },
    subscriptionCode: 'Pro',
    tokens: { limit: 1000, remaining: 850, used: 150 },
  })
})

test('maps the period and the purchased tokens of the summary', async () => {
  const { client } = createTestApiClient(() => ({
    $type: 'personal',
    canPay: true,
    issuesPerMonth: null,
    issuesResetAt: '2026-11-06T12:00:00Z',
    periodEndsAt: '2026-11-06T12:00:00Z',
    periodResets: true,
    purchasedTokensCount: '125000',
    purchasedTokensExpireAt: '2027-04-06T12:00:00Z',
    purchasedTokensExpiringCount: '25000',
    subscriptionCode: 'Free',
    tokens: { limit: '25000', remaining: '25000', used: '0' },
  }))

  const view = await createBillingPageDeps(client, noTariffs).view({})

  assert.equal(view.issuesResetAt, '2026-11-06T12:00:00Z')
  assert.equal(view.periodEndsAt, '2026-11-06T12:00:00Z')
  assert.isTrue(view.periodResets)
  assert.deepEqual(view.purchasedTokens, {
    count: 125_000,
    expireAt: '2027-04-06T12:00:00Z',
    expiringCount: 25_000,
  })
})

test('maps a team billing summary without personal usage', async () => {
  const { client } = createTestApiClient(() => ({
    $type: 'team',
    canPay: false,
    issuesPerMonth: { limit: '100', remaining: '75', used: '25' },
    subscriptionCode: 'Team',
    tokens: { limit: '5000', remaining: '4200', used: '800' },
  }))

  assert.deepEqual(await createBillingPageDeps(client, noTariffs).view({}), {
    canPay: false,
    issuesPerMonth: { limit: 100, remaining: 75, used: 25 },
    issuesResetAt: null,
    kind: 'team',
    periodEndsAt: null,
    periodResets: false,
    purchasedTokens: { count: 0, expireAt: null, expiringCount: 0 },
    subscriptionCode: 'Team',
    tokens: { limit: 5000, remaining: 4200, used: 800 },
  })
})

test('offers all plans, priced as Billing returns them', async () => {
  const { client } = createTestApiClient()
  const requestedUrls: string[] = []
  const deps = createBillingPageDeps(client, async (url) => {
    requestedUrls.push(url)
    return {
      personal: [
        tariff({ id: 'free-id', price: 0, title: 'Free' }),
        tariff({ id: 'plus-id', issuesPerMonth: 500 }),
      ],
      team: [tariff({ id: 'team-id', price: 500, title: 'Team' })],
    }
  })

  const plans = await deps.getPlans({})

  assert.deepEqual(requestedUrls, ['/landing/tariffs'])
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
    title: 'Plus',
    tokens: 300_000,
  })
  assert.deepEqual(
    plans.team.map((plan) => plan.id),
    ['team-id'],
  )
})

test('starts a subscription checkout and returns the payment address', async () => {
  const { client, requests } = createTestApiClient(() => ({
    paymentId: 'payment-id',
    url: 'https://pay.example/checkout',
  }))

  const checkout = await createBillingPageDeps(client, noTariffs).startCheckout({
    currencyCode: 'RUB',
    itemId: 'plus-id',
    kind: 'Subscription',
  })

  assert.equal(checkout.url, 'https://pay.example/checkout')
  assert.equal(new URL(requests[0]!.url).pathname, '/api/billing/checkout')
  assert.deepEqual(await requests[0]!.json(), {
    currencyCode: 'RUB',
    itemId: 'plus-id',
    kind: 'Subscription',
  })
})

test('starts a token pack checkout and returns the payment address', async () => {
  const { client, requests } = createTestApiClient(() => ({
    paymentId: 'payment-id',
    url: 'https://pay.example/checkout',
  }))

  const checkout = await createBillingPageDeps(client, noTariffs).startCheckout({
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

test('reads the token packs from the app route', async () => {
  const { client } = createTestApiClient()
  const packs = [
    {
      currencyCode: 'RUB',
      expirationMonths: 6,
      formattedPrice: '250₽',
      id: 'small-id',
      title: 'Small',
      tokens: 100_000,
    },
  ]
  const requestedUrls: string[] = []
  const deps = createBillingPageDeps(client, async (url) => {
    requestedUrls.push(url)
    return packs
  })

  assert.deepEqual(await deps.getTokenPacks({}), packs)
  assert.deepEqual(requestedUrls, ['/landing/token-packs'])
})

test('reports the status code of a failed token packs request', async () => {
  const { client } = createTestApiClient()
  const deps = createBillingPageDeps(client, async () => {
    throw { statusCode: 502 }
  })

  await expect(deps.getTokenPacks({})).rejects.toMatchObject({ status: 502 })
})
