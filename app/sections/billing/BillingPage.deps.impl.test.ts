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
    paymentCurrencyCode: 'RUB',
    subscriptionCode: 'Pro',
    tokens: { limit: '1000', remaining: '850', used: '150' },
  }))

  assert.deepEqual(await createBillingPageDeps(client, noTariffs).view({}), {
    canPay: true,
    freeTeamOrganizations: { limit: 2, remaining: 1, used: 1 },
    issuesPerMonth: null,
    kind: 'personal',
    paymentCurrencyCode: 'RUB',
    subscriptionCode: 'Pro',
    tokens: { limit: 1000, remaining: 850, used: 150 },
  })
})

test('maps a team billing summary without personal usage', async () => {
  const { client } = createTestApiClient(() => ({
    $type: 'team',
    canPay: false,
    issuesPerMonth: { limit: '100', remaining: '75', used: '25' },
    paymentCurrencyCode: 'RUB',
    subscriptionCode: 'Team',
    tokens: { limit: '5000', remaining: '4200', used: '800' },
  }))

  assert.deepEqual(await createBillingPageDeps(client, noTariffs).view({}), {
    canPay: false,
    issuesPerMonth: { limit: 100, remaining: 75, used: 25 },
    kind: 'team',
    paymentCurrencyCode: 'RUB',
    subscriptionCode: 'Team',
    tokens: { limit: 5000, remaining: 4200, used: 800 },
  })
})

test('offers all plans, priced in the payment currency with a dollar reference', async () => {
  const { client } = createTestApiClient()
  const requestedCurrencies: (string | undefined)[] = []
  const deps = createBillingPageDeps(client, async (_url, options) => {
    requestedCurrencies.push(options.query.currency)
    if (options.query.currency === 'USD') {
      return {
        personal: [
          tariff({ currencyCode: 'USD', formattedPrice: '$0', id: 'free-id', price: 0 }),
          tariff({ currencyCode: 'USD', formattedPrice: '$4', id: 'plus-id', price: 400 }),
        ],
        team: [],
      }
    }
    return {
      personal: [
        tariff({ id: 'free-id', price: 0, title: 'Free' }),
        tariff({ id: 'plus-id', issuesPerMonth: 500 }),
      ],
      team: [tariff({ id: 'team-id', price: 500, title: 'Team' })],
    }
  })

  const plans = await deps.getPlans({ currencyCode: 'RUB' })

  assert.deepEqual(requestedCurrencies, ['RUB', 'USD'])
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
    referencePrice: '$4',
    title: 'Plus',
    tokens: 300_000,
  })
  assert.equal(plans.team[0]!.referencePrice, undefined)
})

test('shows the plans without a reference price when the reference prices cannot be loaded', async () => {
  const { client } = createTestApiClient()
  const deps = createBillingPageDeps(client, async (_url, options) => {
    if (options.query.currency === 'USD') {
      throw { statusCode: 502 }
    }
    return { personal: [tariff({ id: 'plus-id' })], team: [] }
  })

  const plans = await deps.getPlans({ currencyCode: 'RUB' })

  assert.equal(plans.personal[0]!.referencePrice, undefined)
})

test('does not repeat the reference price when payments are in dollars', async () => {
  const { client } = createTestApiClient()
  const requestedCurrencies: (string | undefined)[] = []
  const deps = createBillingPageDeps(client, async (_url, options) => {
    requestedCurrencies.push(options.query.currency)
    return { personal: [tariff({ currencyCode: 'USD', id: 'plus-id' })], team: [] }
  })

  const plans = await deps.getPlans({ currencyCode: 'USD' })

  assert.deepEqual(requestedCurrencies, ['USD'])
  assert.equal(plans.personal[0]!.referencePrice, undefined)
})

test('starts a subscription checkout and returns the payment address', async () => {
  const { client, requests } = createTestApiClient(() => ({
    paymentId: 'payment-id',
    url: 'https://pay.example/checkout',
  }))

  const checkout = await createBillingPageDeps(client, noTariffs).startCheckout({
    planId: 'plus-id',
  })

  assert.equal(checkout.url, 'https://pay.example/checkout')
  assert.equal(new URL(requests[0]!.url).pathname, '/api/billing/checkout')
  assert.deepEqual(await requests[0]!.json(), {
    itemId: 'plus-id',
    kind: 'Subscription',
  })
})
