import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createSpaceSelectDeps } from './SpaceSelect.deps.impl'

const spaces = () => [{ key: 'product', name: 'Product' }]

test('maps space options from the organization endpoint', async () => {
  const { client, paths } = createTestApiClient(spaces)

  assert.deepEqual(await createSpaceSelectDeps(client).loadSpaces({ organizationId: '7' }), [
    { label: 'Product', value: 'product' },
  ])
  assert.deepEqual(paths(), ['/api/movement/organization/7/spaces'])
})

test('falls back to the current organization spaces', async () => {
  const { client, paths } = createTestApiClient(spaces)

  assert.deepEqual(await createSpaceSelectDeps(client).loadSpaces({}), [
    { label: 'Product', value: 'product' },
  ])
  assert.deepEqual(paths(), ['/api/spaces'])
})
