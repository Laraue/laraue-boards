import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createUpdateOrganization } from './updateOrganization'

test('maps update organization request and response', async () => {
  const { client, requests } = createTestApiClient()

  assert.deepEqual(
    await createUpdateOrganization(client)({
      color: '#fff',
      id: '7',
      name: 'Acme',
      slug: 'acme',
    }),
    { data: true, status: 'success' },
  )
  assert.deepEqual(await requests[0]!.json(), {
    color: '#fff',
    id: '7',
    name: 'Acme',
    slug: 'acme',
  })
})
