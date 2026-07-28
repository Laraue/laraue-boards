import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createViewBacklog } from './viewBacklog'

test('maps backlog page data', async () => {
  const { client } = createTestApiClient((_request, path) => {
    if (path === '/api/spaces') {
      return [{ color: '#123', isDefault: false, key: 'product', name: 'Product' }]
    }
    if (path === '/api/organizations/attributes') {
      return []
    }
    if (path === '/api/spaces/product/epics') {
      return [{ id: 8, isDefault: true, name: 'Backlog' }]
    }
    return { data: [], hasNextPage: false }
  })

  assert.deepEqual(
    await createViewBacklog(client)({
      attributeQuery: {},
      page: 1,
      search: '',
      spaceKey: 'product',
    }),
    {
      data: {
        attributes: [],
        backlogBoardId: '8',
        color: '#123',
        hasNextPage: false,
        issues: [],
        spaceKey: 'product',
        title: 'Backlog',
      },
      status: 'success',
    },
  )
})
