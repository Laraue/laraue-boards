import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createSearchBoardIssues } from './searchBoardIssues'

test('maps searched board issues and sends their filters', async () => {
  const { client, requests } = createTestApiClient(() => [
    {
      items: {
        data: [
          {
            assignee: 'Ada',
            assigneeColor: '#111',
            assigneeInitial: 'A',
            content: 'Fix it',
            epicId: 7,
            id: 1,
            key: 'ISS-1',
            spaceId: 2,
            statusId: 3,
            time: '2026-01-01T00:00:00Z',
          },
        ],
        hasNext: true,
        totalCount: 4,
      },
      statusId: 3,
    },
  ])

  assert.deepEqual(
    await createSearchBoardIssues(client)({
      boardId: '7',
      filters: [{ attributeId: '4', type: 'list', valueIds: ['9'] }],
      search: 'bug',
      take: 10,
    }),
    {
      data: {
        columns: [
          {
            hasNext: true,
            id: '3',
            issueCount: 4,
            issues: [
              {
                assigneeColor: '#111',
                assigneeInitial: 'A',
                assigneeName: 'Ada',
                content: 'Fix it',
                issueKey: 'ISS-1',
                time: '2026-01-01T00:00:00Z',
              },
            ],
          },
        ],
        issueCount: 4,
      },
      status: 'success',
    },
  )
  assert.deepEqual(await requests[0]!.json(), {
    epicId: '7',
    filters: { '4': { $type: 'enum', ids: ['9'] } },
    searchString: 'bug',
    take: 10,
  })
})
