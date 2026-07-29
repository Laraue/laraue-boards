import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createCreateSpace } from './createSpace'

test('maps create space request and response', async () => {
  const { client, requests } = createTestApiClient(() => new Response('product-AB12'))

  assert.deepEqual(
    await createCreateSpace(client)({ color: '#fff', key: 'product', name: 'Product' }),
    {
      data: { spaceKey: 'product-AB12' },
      status: 'success',
    },
  )
  assert.deepEqual(await requests[0]!.json(), {
    color: '#fff',
    key: 'product',
    name: 'Product',
  })
})
