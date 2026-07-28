import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createMoveBoardIssue } from './moveBoardIssue'

test('rejects an empty destination and moves to a selected status', async () => {
  const { client, paths } = createTestApiClient(() => new Response(null, { status: 204 }))
  const moveIssue = createMoveBoardIssue(client)

  assert.deepEqual(await moveIssue({ issueKey: 'ISS-1', statusId: '' }), {
    message: 'This issue cannot be moved to that column.',
    status: 'validation-error',
  })
  assert.deepEqual(await moveIssue({ issueKey: 'ISS-1', statusId: '3' }), {
    data: true,
    status: 'success',
  })
  assert.deepEqual(paths(), ['/api/movement/issue/ISS-1/move-to-status/3'])
})
