import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createViewAttributes } from './viewAttributes'

test('maps attributes response', async () => {
  const { client } = createTestApiClient(() => [
    { color: '#fff', id: 7, name: 'Priority', type: 'Text' },
    { color: '#000', id: 8, listValues: [], name: 'Severity', type: 'List' },
  ])

  assert.deepEqual(await createViewAttributes(client)({}), {
    data: [
      { color: '#fff', id: '7', name: 'Priority', type: 'text' },
      { color: '#000', id: '8', name: 'Severity', type: 'list' },
    ],
    status: 'success',
  })
})
