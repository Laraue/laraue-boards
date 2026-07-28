import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createDeleteAttribute } from './deleteAttribute'

test('maps delete attribute response', async () => {
  const { client } = createTestApiClient()

  assert.deepEqual(await createDeleteAttribute(client)({ id: '7' }), {
    data: true,
    status: 'success',
  })
})
