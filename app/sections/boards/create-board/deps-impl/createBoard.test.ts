import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createCreateBoard } from './createBoard'

test('maps create board request and response', async () => {
  const { client, requests } = createTestApiClient((_request, path) =>
    path === '/api/spaces' ? [{ id: 4, key: 'product', name: 'Product' }] : new Response('7'),
  )

  assert.deepEqual(
    await createCreateBoard(client)({ color: '#fff', name: 'Roadmap', spaceKey: 'product' }),
    { data: { boardId: '7' }, status: 'success' },
  )
  assert.deepEqual(await requests[1]!.json(), {
    color: '#fff',
    name: 'Roadmap',
    spaceId: 4,
  })
})
