import { assert, expect, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createMoveBoardsDialogDeps } from './MoveBoardsDialog.deps.impl'

test('rejects moving boards without a selection', async () => {
  const { client, requests } = createTestApiClient()

  await expect(
    createMoveBoardsDialogDeps(client).moveBoards({
      boardIds: [],
      destinationOrganizationId: '',
      destinationSpaceKey: '',
    }),
  ).rejects.toMatchObject({ status: 400 })
  assert.equal(requests.length, 0)
})

test('moves every selected board to the space', async () => {
  const { client, paths, requests } = createTestApiClient()

  await createMoveBoardsDialogDeps(client).moveBoards({
    boardIds: ['21', '22'],
    destinationOrganizationId: '2',
    destinationSpaceKey: 'product',
  })

  assert.deepEqual(paths(), ['/api/movement/move-epic', '/api/movement/move-epic'])
  assert.deepEqual(await Promise.all(requests.map((request) => request.json())), [
    { newOrganizationId: 2, newSpaceKey: 'product', sourceEpicId: 21 },
    { newOrganizationId: 2, newSpaceKey: 'product', sourceEpicId: 22 },
  ])
})
