import { assert, expect, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createSpaceSettingsPageDeps } from './SpaceSettingsPage.deps.impl'

test('maps space settings data', async () => {
  const { client } = createTestApiClient((_request, path) =>
    path === '/api/spaces'
      ? [{ color: '#fff', isDefault: false, key: 'product', name: 'Product' }]
      : { canDelete: true, canUpdate: false },
  )

  assert.deepEqual(await createSpaceSettingsPageDeps(client).view({ spaceKey: 'product' }), {
    canDelete: true,
    canUpdate: false,
    color: '#fff',
    name: 'Product',
  })
})

test('fails with 404 when the space is not in the list', async () => {
  const { client } = createTestApiClient((_request, path) =>
    path === '/api/spaces'
      ? [{ color: '#fff', isDefault: false, key: 'other', name: 'Other' }]
      : { canDelete: true, canUpdate: true },
  )

  await expect(
    createSpaceSettingsPageDeps(client).view({ spaceKey: 'product' }),
  ).rejects.toMatchObject({ status: 404 })
})
