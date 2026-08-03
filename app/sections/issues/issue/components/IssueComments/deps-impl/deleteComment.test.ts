import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createDeleteComment } from './deleteComment'

test('sends a delete comment request', async () => {
  const { client, paths, requests } = createTestApiClient(() => new Response(null, { status: 204 }))

  assert.deepEqual(await createDeleteComment(client)({ id: '12' }), {
    data: true,
    status: 'success',
  })
  assert.deepEqual(paths(), ['/api/issues/comments/12'])
  assert.equal(requests[0]!.method, 'DELETE')
})
