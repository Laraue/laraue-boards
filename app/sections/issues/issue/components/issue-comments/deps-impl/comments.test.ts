import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createCreateComment } from './createComment'
import { createDeleteComment } from './deleteComment'
import { createUpdateComment } from './updateComment'

test('sends create, update, and delete comment requests', async () => {
  const { client, paths, requests } = createTestApiClient((request) =>
    request.method === 'POST' ? new Response('12') : new Response(null, { status: 204 }),
  )
  const create = createCreateComment(client)
  const update = createUpdateComment(client)
  const remove = createDeleteComment(client)

  assert.deepEqual(await create({ issueKey: 'ISS-1', text: 'First' }), {
    data: true,
    status: 'success',
  })
  assert.deepEqual(await update({ id: '12', text: 'Edited' }), {
    data: true,
    status: 'success',
  })
  assert.deepEqual(await remove({ id: '12' }), { data: true, status: 'success' })
  assert.deepEqual(paths(), [
    '/api/issues/comments',
    '/api/issues/comments/12',
    '/api/issues/comments/12',
  ])
  assert.equal(requests[1]!.method, 'PUT')
  assert.equal(requests[2]!.method, 'DELETE')
  assert.deepEqual(Object.fromEntries(await requests[0]!.formData()), {
    IssueKey: 'ISS-1',
    Text: 'First',
  })
  assert.deepEqual(Object.fromEntries(await requests[1]!.formData()), { Text: 'Edited' })
})
