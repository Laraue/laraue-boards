import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createViewBacklogIssue } from './viewBacklogIssue'

test('maps backlog issue page data', async () => {
  const { client } = createTestApiClient((_request, path) => {
    if (path === '/api/spaces') {
      return [{ isDefault: false, key: 'product-ABCD', name: 'Product' }]
    }
    if (path === '/api/spaces/product-ABCD/epics') {
      return [{ id: 8, isDefault: true, name: 'Backlog' }]
    }
    if (path === '/api/epics/8') {
      return { canCreateIssues: true }
    }
    return []
  })

  assert.deepEqual(await createViewBacklogIssue(client)({ spaceKey: 'product-ABCD' }), {
    data: {
      attributes: [],
      boardId: '8',
      boardName: 'Backlog',
      spaceKey: 'product-ABCD',
    },
    status: 'success',
  })
})
