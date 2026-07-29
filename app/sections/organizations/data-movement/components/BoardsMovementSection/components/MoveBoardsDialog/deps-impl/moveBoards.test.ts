import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createMoveBoards } from './moveBoards'

test('rejects moving boards without a selection', async () => {
  const { client } = createTestApiClient()

  assert.deepEqual(
    await createMoveBoards(client)({
      boardIds: [],
      destinationOrganizationId: '',
      destinationSpaceKey: '',
    }),
    { code: 400, status: 'error' },
  )
})

test('moves every selected board to the space', async () => {
  const { client, paths, requests } = createTestApiClient()

  assert.deepEqual(
    await createMoveBoards(client)({
      boardIds: ['21', '22'],
      destinationOrganizationId: '2',
      destinationSpaceKey: 'product',
    }),
    { data: true, status: 'success' },
  )
  assert.deepEqual(paths(), ['/api/movement/move-epic', '/api/movement/move-epic'])
  assert.deepEqual(await Promise.all(requests.map((request) => request.json())), [
    { newOrganizationId: 2, newSpaceKey: 'product', sourceEpicId: 21 },
    { newOrganizationId: 2, newSpaceKey: 'product', sourceEpicId: 22 },
  ])
})

test('returns error status when moving boards fails', async () => {
  const { client } = createTestApiClient(() => new Response(null, { status: 403 }))

  assert.deepEqual(
    await createMoveBoards(client)({
      boardIds: ['21'],
      destinationOrganizationId: '2',
      destinationSpaceKey: 'product',
    }),
    {
      code: 403,
      status: 'error',
    },
  )
})
