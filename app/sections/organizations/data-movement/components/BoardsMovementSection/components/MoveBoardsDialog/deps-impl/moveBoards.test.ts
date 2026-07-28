import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createMoveBoards } from './moveBoards'

test('rejects moving boards without a selection', async () => {
  const { client } = createTestApiClient()

  assert.deepEqual(await createMoveBoards(client)({ boardIds: [], destinationSpaceKey: '' }), {
    code: 400,
    status: 'error',
  })
})

test('moves every selected board to the space', async () => {
  const { client, paths } = createTestApiClient()

  assert.deepEqual(
    await createMoveBoards(client)({ boardIds: ['21', '22'], destinationSpaceKey: 'product' }),
    { data: true, status: 'success' },
  )
  assert.deepEqual(paths(), [
    '/api/movement/epic/21/to-space/product',
    '/api/movement/epic/22/to-space/product',
  ])
})

test('returns error status when moving boards fails', async () => {
  const { client } = createTestApiClient(() => new Response(null, { status: 403 }))

  assert.deepEqual(
    await createMoveBoards(client)({ boardIds: ['21'], destinationSpaceKey: 'product' }),
    {
      code: 403,
      status: 'error',
    },
  )
})
