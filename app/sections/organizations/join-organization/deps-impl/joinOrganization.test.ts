import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createJoinOrganization } from './joinOrganization'

test('maps an unauthenticated response to a sign-in outcome', async () => {
  const { client } = createTestApiClient(() => new Response(null, { status: 401 }))

  assert.deepEqual(await createJoinOrganization(client)({ code: 'invite-123' }), {
    data: 'sign-in-required',
    status: 'success',
  })
})
