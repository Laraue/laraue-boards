import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createSearchBacklog } from './searchBacklog'

test('maps backlog search request and response', async () => {
  const { client, requests } = createTestApiClient(() => ({
    data: [
      {
        assignee: 'Ada',
        assigneeColor: '#111',
        assigneeInitial: 'A',
        canEdit: true,
        content: 'Fix the bug',
        epic: { color: '#222', name: 'Backlog' },
        key: 'ISS-1',
        space: { color: '#333', name: 'Product' },
        status: null,
      },
    ],
    hasNextPage: false,
  }))

  const result = await createSearchBacklog(client)({
    backlogBoardId: '8',
    filters: [],
    page: 2,
    search: 'bug',
  })

  assert.equal(result.status === 'success' && result.data.issues[0]?.issueKey, 'ISS-1')
  assert.deepEqual(await requests[0]!.json(), {
    epicIds: ['8'],
    filters: {},
    page: 1,
    perPage: 10,
    searchString: 'bug',
    sorting: { $type: 'property', direction: 1, property: 1 },
  })
})
