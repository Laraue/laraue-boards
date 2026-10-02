import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createUserAccountPageDeps } from './UserAccountPage.deps.impl'

const preferences = {} as Parameters<typeof createUserAccountPageDeps>[1]

test('reports a signed-out visitor instead of an error', async () => {
  const { client } = createTestApiClient(() => new Response(null, { status: 401 }))

  assert.deepEqual(await createUserAccountPageDeps(client, preferences).view({}), {
    kind: 'signed-out',
  })
})
