import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createRemoveOrganization } from './removeOrganization'

test('removes the requested organization', async () => {
  const { client, requests } = createTestApiClient(() => new Response(null, { status: 200 }))

  assert.deepEqual(await createRemoveOrganization(client)({ id: '7' }), {
    data: true,
    status: 'success',
  })
  assert.equal(new URL(requests[0]!.url).pathname, '/api/organizations/7')
  assert.equal(requests[0]!.method, 'DELETE')
})
