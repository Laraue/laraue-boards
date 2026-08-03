import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createCreateComment } from './createComment'

test('sends a create comment request', async () => {
  const { client, paths, requests } = createTestApiClient(() => new Response('12'))

  assert.deepEqual(await createCreateComment(client)({ issueKey: 'ISS-1', text: 'First' }), {
    data: true,
    status: 'success',
  })
  assert.deepEqual(paths(), ['/api/issues/comments'])
  assert.equal(requests[0]!.method, 'POST')
  assert.deepEqual(Object.fromEntries(await requests[0]!.formData()), {
    IssueKey: 'ISS-1',
    Text: 'First',
  })
})
