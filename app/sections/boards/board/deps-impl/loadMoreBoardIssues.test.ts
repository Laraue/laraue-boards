import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createLoadMoreBoardIssues } from './loadMoreBoardIssues'

test('loads and maps another status page', async () => {
  const { client, requests } = createTestApiClient(() => ({
    data: [
      {
        assignee: 'Ada',
        assigneeColor: '#111',
        assigneeInitial: null,
        content: null,
        epicId: 7,
        id: 1,
        key: 'ISS-1',
        spaceId: 2,
        statusId: 3,
        time: '2026-01-01T00:00:00Z',
      },
    ],
    hasNext: true,
  }))

  assert.deepEqual(
    await createLoadMoreBoardIssues(client)({
      filters: [],
      offset: 10,
      search: '',
      statusId: '3',
      take: 10,
    }),
    {
      data: {
        hasNext: true,
        issues: [
          {
            assigneeColor: '#111',
            assigneeInitial: '?',
            assigneeName: 'Ada',
            content: '',
            issueKey: 'ISS-1',
            time: '2026-01-01T00:00:00Z',
          },
        ],
      },
      status: 'success',
    },
  )
  assert.equal(new URL(requests[0]!.url).pathname, '/api/issues/by-status/3/search')
  assert.deepEqual(await requests[0]!.json(), {
    filters: {},
    skip: 10,
    sorting: { $type: 'property', direction: 1, property: 1 },
    take: 10,
  })
})
