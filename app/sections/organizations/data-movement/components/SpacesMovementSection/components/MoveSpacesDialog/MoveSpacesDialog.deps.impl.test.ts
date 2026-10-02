import { assert, expect, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createMoveSpacesDialogDeps } from './MoveSpacesDialog.deps.impl'

test('rejects moving spaces without a destination', async () => {
  const { client, requests } = createTestApiClient()

  await expect(
    createMoveSpacesDialogDeps(client).moveSpaces({ destinationOrganizationId: '', spaceKeys: [] }),
  ).rejects.toMatchObject({ status: 400 })
  assert.equal(requests.length, 0)
})

test('moves every selected space to the organization', async () => {
  const { client, paths } = createTestApiClient()

  await createMoveSpacesDialogDeps(client).moveSpaces({
    destinationOrganizationId: '2',
    spaceKeys: ['web', 'product'],
  })

  assert.deepEqual(paths(), [
    '/api/movement/space/web/to-organization/2',
    '/api/movement/space/product/to-organization/2',
  ])
})
