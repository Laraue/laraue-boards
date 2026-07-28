import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createUpdateSpace } from './updateSpace'

test('maps update space request', async () => {
  const { client, requests } = createTestApiClient()

  assert.deepEqual(
    await createUpdateSpace(client)({
      color: '#fff',
      key: 'product',
      name: 'Product',
      spaceId: '4',
    }),
    { data: true, status: 'success' },
  )
  assert.deepEqual(await requests[0]!.json(), {
    color: '#fff',
    id: '4',
    key: 'product',
    name: 'Product',
  })
})
