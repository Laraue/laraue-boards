import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createViewApiKeys } from './viewApiKeys'

test('loads and maps API keys with pagination', async () => {
  const { client, requests } = createTestApiClient(() => ({
    data: [
      {
        createdAt: '2026-09-22T10:00:00Z',
        id: 'key-1',
        keyPrefix: 'brd_',
        lastUsedAt: null,
        name: 'CI',
        revokedAt: null,
      },
    ],
    hasNextPage: true,
    page: 1,
    perPage: 20,
  }))

  assert.deepEqual(await createViewApiKeys(client)({ page: 2 }), {
    data: {
      hasNextPage: true,
      keys: [
        {
          createdAt: '2026-09-22T10:00:00Z',
          id: 'key-1',
          keyPrefix: 'brd_',
          lastUsedAt: null,
          name: 'CI',
          revokedAt: null,
        },
      ],
    },
    status: 'success',
  })
  assert.deepEqual(await requests[0]!.json(), { pagination: { page: 1, perPage: 20 } })
})
