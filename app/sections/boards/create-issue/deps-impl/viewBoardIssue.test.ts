import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createViewBoardIssue } from './viewBoardIssue'

test('maps board issue page data', async () => {
  const { client } = createTestApiClient((_request, path) => {
    if (path === '/api/epics/7') {
      return { canCreateIssues: true, name: 'Roadmap' }
    }
    if (path === '/api/spaces') {
      return [{ id: 4, key: 'product-ABCD', name: 'Product' }]
    }
    return []
  })

  assert.deepEqual(await createViewBoardIssue(client)({ boardId: '7', spaceKey: 'product-ABCD' }), {
    data: {
      attributes: [],
      boardName: 'Roadmap',
      spaceKey: 'product-ABCD',
    },
    status: 'success',
  })
})
