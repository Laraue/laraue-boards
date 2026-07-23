import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createSaveIssue } from './saveIssue'

test('reports a partial save when moving the issue fails', async () => {
  const { client } = createTestApiClient((request) =>
    request.method === 'PUT'
      ? new Response(null, { status: 204 })
      : new Response(null, { status: 503 }),
  )

  const result = await createSaveIssue(client)({
    assigneeId: '4',
    attributeValues: [],
    boardId: '8',
    content: 'Updated issue',
    files: [],
    issueKey: 'ISS-42',
    previousBoardId: '7',
    previousStatusId: '2',
    removeAttachmentIds: [],
    statusId: '3',
  })

  assert.deepEqual(result, {
    data: {
      boardId: '7',
      complete: false,
      content: 'Updated issue',
      issueKey: 'ISS-42',
      previousBoardId: '7',
      previousStatusId: '2',
      statusId: '2',
    },
    status: 'success',
  })
})
