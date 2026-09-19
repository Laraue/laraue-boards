import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createViewBilling } from './viewBilling'

test('maps the billing summary and its nullable limits', async () => {
  const { client } = createTestApiClient(() => ({
    $type: 'personal',
    freeTeamOrganizations: { limit: '2', remaining: '1', used: '1' },
    issuesPerMonth: null,
    subscriptionCode: 'Pro',
    tokens: { limit: '1000', remaining: '850', used: '150' },
  }))

  assert.deepEqual(await createViewBilling(client)({}), {
    data: {
      freeTeamOrganizations: { limit: 2, remaining: 1, used: 1 },
      issuesPerMonth: null,
      kind: 'personal',
      subscriptionCode: 'Pro',
      tokens: { limit: 1000, remaining: 850, used: 150 },
    },
    status: 'success',
  })
})
