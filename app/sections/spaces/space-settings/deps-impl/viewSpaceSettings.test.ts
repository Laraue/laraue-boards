import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createViewSpaceSettings } from './viewSpaceSettings'

test('maps space settings data', async () => {
  const { client } = createTestApiClient((_request, path) =>
    path === '/api/spaces'
      ? [{ color: '#fff', id: 4, key: 'product', name: 'Product' }]
      : { canDelete: true, canUpdate: false },
  )

  assert.deepEqual(await createViewSpaceSettings(client)({ spaceKey: 'product' }), {
    data: {
      canDelete: true,
      canUpdate: false,
      color: '#fff',
      id: '4',
      name: 'Product',
      spaceKey: 'product',
    },
    status: 'success',
  })
})
