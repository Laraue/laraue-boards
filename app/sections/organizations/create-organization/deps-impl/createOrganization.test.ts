import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createCreateOrganization } from './createOrganization'

test('maps create organization request and response', async () => {
  const { client, requests } = createTestApiClient(() => ({
    id: 42,
    slug: 'acme',
    slugPostfix: 'ABC1',
  }))

  assert.deepEqual(
    await createCreateOrganization(client)({ color: '#fff', name: 'Acme', slug: 'acme' }),
    {
      data: { organizationId: '42' },
      status: 'success',
    },
  )
  assert.deepEqual(await requests[0]!.json(), {
    color: '#fff',
    name: 'Acme',
    slug: 'acme',
  })
})
