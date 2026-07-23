import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createSelectOrganization } from './selectOrganization'

test('selects an organization', async () => {
  const { client, requests } = createTestApiClient(() => new Response(null, { status: 204 }))

  assert.deepEqual(await createSelectOrganization(client)({ organizationId: '42' }), {
    data: true,
    status: 'success',
  })
  assert.deepEqual(await requests[0]!.json(), { organizationId: '42' })
})
