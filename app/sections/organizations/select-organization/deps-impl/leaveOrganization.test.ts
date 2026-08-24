import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createLeaveOrganization } from './leaveOrganization'

test('leaves an organization from the picker', async () => {
  const { client, requests } = createTestApiClient(() => new Response(null, { status: 200 }))

  assert.deepEqual(await createLeaveOrganization(client)({ id: '7' }), {
    data: true,
    status: 'success',
  })
  assert.equal(new URL(requests[0]!.url).pathname, '/api/organizations/7/leave')
  assert.equal(requests[0]!.method, 'POST')
})
