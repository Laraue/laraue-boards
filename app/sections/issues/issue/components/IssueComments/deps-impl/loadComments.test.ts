import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createLoadComments } from './loadComments'

test('maps comments from the comments endpoint', async () => {
  const { client, requests } = createTestApiClient(() => ({
    data: [
      {
        canModify: true,
        createdAt: '2026-01-03T00:00:00Z',
        id: 8,
        owner: { color: '#444', displayName: 'Ada', initials: 'A' },
        text: 'A comment',
        updatedAt: '2026-01-04T00:00:00Z',
      },
    ],
    hasNextPage: false,
    page: 0,
    perPage: 100,
  }))

  assert.deepEqual(await createLoadComments(client)({ issueKey: 'ISS-1' }), {
    data: [
      {
        canModify: true,
        createdAt: '2026-01-03T00:00:00Z',
        id: '8',
        owner: { color: '#444', initials: 'A', name: 'Ada' },
        text: 'A comment',
        updatedAt: '2026-01-04T00:00:00Z',
      },
    ],
    status: 'success',
  })
  const request = requests[0]!
  assert.equal(request.method, 'POST')
  assert.equal(new URL(request.url).pathname, '/api/issues/ISS-1/comments')
  assert.deepEqual(await request.json(), { pagination: { page: 0, perPage: 100 } })
})
