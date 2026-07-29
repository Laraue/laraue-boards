import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createLoadComments } from './loadComments'

test('maps comments from the issue', async () => {
  const { client, paths } = createTestApiClient(() => ({
    comments: [
      {
        canModify: true,
        createdAt: '2026-01-03T00:00:00Z',
        id: 8,
        owner: { color: '#444', displayName: 'Ada', initials: 'A' },
        text: 'A comment',
        updatedAt: '2026-01-04T00:00:00Z',
      },
    ],
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
  assert.deepEqual(paths(), ['/api/issues/ISS-1'])
})
