import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createRemoveSpace } from './removeSpace'

test('removes the requested space', async () => {
  const { client, requests } = createTestApiClient(() => new Response(null, { status: 204 }))

  assert.deepEqual(await createRemoveSpace(client)({ spaceKey: 'product' }), {
    data: true,
    status: 'success',
  })
  assert.equal(new URL(requests[0]!.url).pathname, '/api/spaces/product')
})
