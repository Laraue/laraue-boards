import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createUpdateComment } from './updateComment'

test('sends an update comment request', async () => {
  const { client, paths, requests } = createTestApiClient(() => new Response(null, { status: 204 }))

  assert.deepEqual(await createUpdateComment(client)({ id: '12', text: 'Edited' }), {
    data: true,
    status: 'success',
  })
  assert.deepEqual(paths(), ['/api/issues/comments/12'])
  assert.equal(requests[0]!.method, 'PUT')
  assert.deepEqual(Object.fromEntries(await requests[0]!.formData()), { Text: 'Edited' })
})
