import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createViewTransactions } from './viewTransactions'

test('loads personal transactions with one-based UI pagination converted to API pagination', async () => {
  const { client, requests } = createTestApiClient(() => ({
    data: [
      {
        createdAt: '2026-09-19T10:00:00Z',
        delta: '-25',
        error: null,
        finishedAt: '2026-09-19T10:00:01Z',
        id: 'transaction-1',
        reason: 'Spend',
        status: 'Confirmed',
      },
    ],
    hasNextPage: true,
    page: 1,
    perPage: 20,
  }))

  assert.deepEqual(await createViewTransactions(client)({ page: 2 }), {
    data: {
      hasNextPage: true,
      transactions: [
        {
          createdAt: '2026-09-19T10:00:00Z',
          delta: -25,
          error: null,
          finishedAt: '2026-09-19T10:00:01Z',
          id: 'transaction-1',
          ownerName: null,
          reason: 'Spend',
          status: 'Confirmed',
        },
      ],
    },
    status: 'success',
  })
  assert.deepEqual(await requests[0]!.json(), { pagination: { page: 1, perPage: 20 } })
})
