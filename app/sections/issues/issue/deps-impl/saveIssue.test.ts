import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createSaveIssue } from './saveIssue'

test('returns the new issue key after moving it to another space', async () => {
  const { client } = createTestApiClient((request) =>
    request.method === 'PUT' ? new Response(null, { status: 204 }) : { 'ISS-42': 'BACKLOG-9000' },
  )

  const result = await createSaveIssue(client)({
    assigneeId: '4',
    attributeValues: [],
    boardId: '8',
    content: 'Updated issue',
    files: [],
    issueKey: 'ISS-42',
    previousBoardId: '7',
    previousSpaceKey: 'ISS',
    previousStatusId: '2',
    removeAttachmentIds: [],
    spaceKey: 'BRD',
    statusId: '3',
  })

  assert.deepEqual(
    result.status === 'success'
      ? { issueKey: result.data.issueKey, previousIssueKey: result.data.previousIssueKey }
      : undefined,
    { issueKey: 'BACKLOG-9000', previousIssueKey: 'ISS-42' },
  )
})

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
    previousSpaceKey: 'ISS',
    previousStatusId: '2',
    removeAttachmentIds: [],
    spaceKey: 'BRD',
    statusId: '3',
  })

  assert.deepEqual(result, {
    data: {
      boardId: '7',
      complete: false,
      content: 'Updated issue',
      issueKey: 'ISS-42',
      previousBoardId: '7',
      previousIssueKey: 'ISS-42',
      previousStatusId: '2',
      spaceKey: 'ISS',
      statusId: '2',
    },
    status: 'success',
  })
})
