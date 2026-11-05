import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createBacklogPageDeps } from './BacklogPage.deps.impl'

const catalog = () => ({
  attributes: [],
  spaces: [{ color: '#123', key: 'product', name: 'Product' }],
})

test('maps backlog page data', async () => {
  const { client } = createTestApiClient((_request, path) => {
    if (path === '/api/spaces/product/epics') {
      return [{ id: 8, isDefault: true, name: 'Backlog' }]
    }
    return { data: [], hasNextPage: false }
  })

  assert.deepEqual(
    await createBacklogPageDeps(client, catalog).view({
      attributeQuery: {},
      page: 1,
      search: '',
      spaceKey: 'product',
    }),
    {
      attributes: [],
      backlogBoardId: '8',
      hasNextPage: false,
      issues: [],
      spaceColor: '#123',
      spaceName: 'Product',
      title: 'Backlog',
    },
  )
})

test('maps backlog search request and response', async () => {
  const { client, requests } = createTestApiClient(() => ({
    data: [
      {
        assignee: 'Ada',
        assigneeColor: '#111',
        assigneeInitial: 'A',
        attributes: [],
        canEdit: true,
        content: 'Fix the bug',
        epic: { color: '#222', name: 'Backlog' },
        key: 'ISS-1',
        space: { color: '#333', name: 'Product' },
        status: null,
        time: '2026-01-01T10:00:00Z',
      },
    ],
    hasNextPage: false,
  }))

  const result = await createBacklogPageDeps(client, catalog).search({
    backlogBoardId: '8',
    filters: [],
    page: 2,
    search: 'bug',
  })

  assert.equal(result.issues[0]?.issueKey, 'ISS-1')
  assert.equal(result.issues[0]?.time, '2026-01-01T10:00:00Z')
  assert.deepEqual(await requests[0]!.json(), {
    epicIds: [8],
    filters: {},
    page: 1,
    perPage: 20,
    searchString: 'bug',
    sorting: { $type: 'property', direction: 'Descending', property: 'CreatedAt' },
  })
})
