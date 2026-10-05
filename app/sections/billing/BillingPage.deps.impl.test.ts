import { assert, test } from 'vitest'

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
    kind: 'personal',
    subscriptionCode: 'Pro',
    tokens: { limit: 1000, remaining: 850, used: 150 },
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
    kind: 'team',
    subscriptionCode: 'Team',
    tokens: { limit: 5000, remaining: 4200, used: 800 },
  })
})

test('offers only paid plans, priced in rubles', async () => {
  const { client } = createTestApiClient()
  let requestedCurrency: string | undefined
  const deps = createBillingPageDeps(client, async (_url, options) => {
    requestedCurrency = options.query.currency
    return {
      personal: [
        tariff({ id: 'free-id', price: 0, title: 'Free' }),
        tariff({ id: 'plus-id', issuesPerMonth: 500 }),
      ],
      team: [tariff({ id: 'team-id', price: 500, title: 'Team' })],
    }
  })

  const plans = await deps.getPlans({})

  assert.equal(requestedCurrency, 'RUB')
  assert.deepEqual(plans.personal, [
    {
      currencyCode: 'RUB',
      formattedPrice: '334₽',
      id: 'plus-id',
      issuesPerMonth: 500,
      title: 'Plus',
      tokens: 300_000,
    },
  ])
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
    planId: 'plus-id',
  })

  assert.equal(checkout.url, 'https://pay.example/checkout')
  assert.equal(new URL(requests[0]!.url).pathname, '/api/billing/checkout')
  assert.deepEqual(await requests[0]!.json(), {
    currencyCode: 'RUB',
    itemId: 'plus-id',
    kind: 'Subscription',
  })
})
