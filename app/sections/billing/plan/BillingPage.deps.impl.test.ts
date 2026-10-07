import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createBillingPageDeps } from './BillingPage.deps.impl'

test('maps the billing summary and its nullable limits', async () => {
  const { client } = createTestApiClient(() => ({
    $type: 'personal',
    canPay: true,
    freeTeamOrganizations: { limit: '2', remaining: '1', used: '1' },
    issuesPerMonth: null,
    subscriptionCode: 'Pro',
    tokens: { limit: '1000', remaining: '850', used: '150' },
  }))

  assert.deepEqual(await createBillingPageDeps(client).view({}), {
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

  const view = await createBillingPageDeps(client).view({})

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

  assert.deepEqual(await createBillingPageDeps(client).view({}), {
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

