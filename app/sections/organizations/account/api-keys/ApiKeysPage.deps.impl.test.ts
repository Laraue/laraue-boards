import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createApiKeysPageDeps } from './ApiKeysPage.deps.impl'

test('asks for revoked keys only when they are shown', async () => {
  const { client, requests } = createTestApiClient(() => ({ data: [], hasNextPage: false }))
  const deps = createApiKeysPageDeps(client)

  await deps.view({ includeRevoked: false, page: 1 })
  await deps.view({ includeRevoked: true, page: 2 })

  assert.deepEqual(await requests[0]!.json(), {
    includeRevoked: false,
    pagination: { page: 0, perPage: 20 },
  })
  assert.deepEqual(await requests[1]!.json(), {
    includeRevoked: true,
    pagination: { page: 1, perPage: 20 },
  })
})
