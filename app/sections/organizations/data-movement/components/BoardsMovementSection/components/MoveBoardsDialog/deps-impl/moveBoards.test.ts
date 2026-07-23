import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createMoveBoards } from './moveBoards'

test('rejects moving boards without a selection', async () => {
  const { client } = createTestApiClient()

  assert.deepEqual(await createMoveBoards(client)({ boardIds: [], destinationSpaceId: '' }), {
    code: 400,
    status: 'error',
  })
})

test('moves every selected board to the space', async () => {
  const { client, paths } = createTestApiClient()

  assert.deepEqual(
    await createMoveBoards(client)({ boardIds: ['21', '22'], destinationSpaceId: '10' }),
    { data: true, status: 'success' },
  )
  assert.deepEqual(paths(), [
    '/api/movement/epic/21/to-space/10',
    '/api/movement/epic/22/to-space/10',
  ])
})

test('returns error status when moving boards fails', async () => {
  const { client } = createTestApiClient(() => new Response(null, { status: 403 }))

  assert.deepEqual(await createMoveBoards(client)({ boardIds: ['21'], destinationSpaceId: '10' }), {
    code: 403,
    status: 'error',
  })
})
