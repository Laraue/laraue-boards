import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createViewBoardPage } from './viewBoardPage'

test('loads the board, attributes, and initial issue columns', async () => {
  const { client, requests } = createTestApiClient((_request, path) => {
    if (path === '/api/organizations/attributes') {
      return [{ color: '#111', id: 3, listValues: [], name: 'Priority', type: 'Text' }]
    }
    if (path === '/api/epics/7') {
      return {
        canCreateIssues: true,
        canDeleteIssues: false,
        canUpdateIssues: true,
        color: '#222',
        name: 'Roadmap',
        statuses: [{ color: '#333', id: 4, name: 'To do', sortOrder: 1 }],
      }
    }
    return [{ items: { data: [], hasNext: false, totalCount: 0 }, statusId: 4 }]
  })

  const result = await createViewBoardPage(client)({
    attributeQuery: { 3: ['urgent'] },
    boardId: '7',
    search: 'bug',
  })

  assert.equal(result.status === 'success' && result.data.columns[0]?.title, 'To do')
  const request = requests.find((value) => new URL(value.url).pathname === '/api/issues/board')
  assert.deepEqual(await request?.json(), {
    epicId: '7',
    filters: { '3': { $type: 'string', searchString: 'urgent' } },
    searchString: 'bug',
    take: 25,
  })
})
