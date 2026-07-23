import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createLogout } from './logout'

test('clears the local session even when logout request fails', async () => {
  const { client } = createTestApiClient(() => new Response(null, { status: 503 }))

  assert.deepEqual(await createLogout(client)(), { data: true, status: 'success' })
})
