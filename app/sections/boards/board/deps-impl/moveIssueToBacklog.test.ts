import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createMoveIssueToBacklog } from './moveIssueToBacklog'

test('finds the first backlog status and moves the issue there', async () => {
  const { client, paths } = createTestApiClient((_request, path) => {
    if (path === '/api/spaces/product/epics') {
      return [
        { id: 7, isDefault: false, name: 'Roadmap' },
        { id: 8, isDefault: true, name: 'Backlog' },
      ]
    }
    if (path === '/api/epics/8') {
      return {
        canCreateIssues: false,
        canDeleteIssues: false,
        canUpdateIssues: false,
        color: null,
        name: 'Backlog',
        statuses: [
          { color: null, id: 5, name: 'Later', sortOrder: 2 },
          { color: null, id: 4, name: 'Inbox', sortOrder: 1 },
        ],
      }
    }
    return new Response(null, { status: 204 })
  })

  assert.deepEqual(
    await createMoveIssueToBacklog(client)({
      boardId: '7',
      issueKey: 'ISS-1',
      spaceKey: 'product',
    }),
    { data: true, status: 'success' },
  )
  assert.deepEqual(paths(), ['/api/spaces/product/epics', '/api/epics/8', '/api/issues/status'])
})
