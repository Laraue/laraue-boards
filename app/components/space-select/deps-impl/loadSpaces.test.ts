import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createLoadSpaces } from './loadSpaces'

const spaces = () => [{ id: 2, name: 'Product' }]

test('maps space options from the organization endpoint', async () => {
  const { client, paths } = createTestApiClient(spaces)

  assert.deepEqual(await createLoadSpaces(client)({ organizationId: '7' }), {
    data: [{ label: 'Product', value: '2' }],
    status: 'success',
  })
  assert.deepEqual(paths(), ['/api/movement/organization/7/spaces'])
})

test('falls back to the current organization spaces', async () => {
  const { client, paths } = createTestApiClient(spaces)

  assert.deepEqual(await createLoadSpaces(client)({}), {
    data: [{ label: 'Product', value: '2' }],
    status: 'success',
  })
  assert.deepEqual(paths(), ['/api/spaces'])
})
