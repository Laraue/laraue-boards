import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createBillingPageDeps } from './BillingPage.deps.impl'

test('maps the billing summary and its nullable limits', async () => {
  const { client } = createTestApiClient(() => ({
    $type: 'personal',
    freeTeamOrganizations: { limit: '2', remaining: '1', used: '1' },
    issuesPerMonth: null,
    subscriptionCode: 'Pro',
    tokens: { limit: '1000', remaining: '850', used: '150' },
  }))

  assert.deepEqual(await createBillingPageDeps(client).view({}), {
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
    issuesPerMonth: { limit: '100', remaining: '75', used: '25' },
    subscriptionCode: 'Team',
    tokens: { limit: '5000', remaining: '4200', used: '800' },
  }))

  assert.deepEqual(await createBillingPageDeps(client).view({}), {
    issuesPerMonth: { limit: 100, remaining: 75, used: 25 },
    kind: 'team',
    subscriptionCode: 'Team',
    tokens: { limit: 5000, remaining: 4200, used: 800 },
  })
})
