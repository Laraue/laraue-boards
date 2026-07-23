import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createRemoveBoard } from './removeBoard'

test('removes the requested board', async () => {
  const { client, requests } = createTestApiClient(() => new Response(null, { status: 204 }))

  assert.deepEqual(await createRemoveBoard(client)({ boardId: '12' }), {
    data: true,
    status: 'success',
  })
  assert.equal(new URL(requests[0]!.url).pathname, '/api/epics/12')
})
