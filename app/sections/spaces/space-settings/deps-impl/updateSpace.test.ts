import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createUpdateSpace } from './updateSpace'

test('maps update space request', async () => {
  const { client, requests } = createTestApiClient()

  assert.deepEqual(
    await createUpdateSpace(client)({
      color: '#fff',
      name: 'Product',
      newKey: 'product-next',
      oldKey: 'product',
    }),
    { data: true, status: 'success' },
  )
  assert.deepEqual(await requests[0]!.json(), {
    color: '#fff',
    name: 'Product',
    newKey: 'product-next',
    oldKey: 'product',
  })
})
