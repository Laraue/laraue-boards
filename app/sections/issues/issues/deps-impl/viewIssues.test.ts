import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createViewIssues } from './viewIssues'

test('loads the initial issues page data', async () => {
  const { client } = createTestApiClient((_request, path) => {
    if (path === '/api/organizations/attributes') {
      return []
    }
    if (path === '/api/spaces') {
      return [{ key: 'product', name: 'Product' }]
    }
    return { data: [], hasNextPage: false }
  })

  assert.deepEqual(
    await createViewIssues(client)({
      attributeQuery: {},
      epicStatuses: [],
      page: 1,
      search: '',
      spaceIds: [],
    }),
    {
      data: {
        attributes: [],
        hasNextPage: false,
        issues: [],
        spaces: [{ label: 'Product', value: 'product' }],
      },
      status: 'success',
    },
  )
})
