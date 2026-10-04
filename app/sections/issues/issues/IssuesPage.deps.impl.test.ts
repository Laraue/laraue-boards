import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'
import { COLORS } from '~/constants/colors'

import { createIssuesPageDeps } from './IssuesPage.deps.impl'

const response = () => ({
  data: [
    {
      assignee: 'Ada',
      assigneeColor: '#111',
      assigneeId: 'ada',
      assigneeInitial: 'A',
      canEdit: true,
      content: 'Fix search',
      epic: { color: '#222', name: 'Roadmap' },
      epicId: 5,
      key: 'ISS-1',
      space: { color: '#333', name: 'Product' },
      spaceKey: 'product',
      status: { category: 'Created', color: '#444', name: 'Todo' },
      statusId: 6,
      title: 'Fix search',
    },
    {
      assignee: 'Grace',
      assigneeColor: '#555',
      assigneeId: 'grace',
      assigneeInitial: null,
      canEdit: false,
      content: null,
      epic: { color: '#666', name: 'Backlog board' },
      epicId: 8,
      key: 'ISS-2',
      space: { color: '#777', name: 'Product' },
      spaceKey: 'product',
      status: null,
      statusId: 9,
      title: '',
    },
  ],
  hasNextPage: true,
})

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
    await createIssuesPageDeps(client).view({
      attributeQuery: {},
      epicStatuses: [],
      page: 1,
      search: '',
      spaceIds: [],
    }),
    {
      attributes: [],
      hasNextPage: false,
      issues: [],
      spaces: [{ label: 'Product', value: 'product' }],
    },
  )
})

test('maps searched issues', async () => {
  const { client } = createTestApiClient(response)

  assert.deepEqual(
    await createIssuesPageDeps(client).searchIssues({
      epicStatuses: [],
      filters: [],
      page: 1,
      search: 'search',
      spaceIds: [],
    }),
    {
      hasNextPage: true,
      issues: [
        {
          assignee: 'Ada',
          assigneeColor: '#111',
          assigneeId: 'ada',
          assigneeInitial: 'A',
          boardColor: '#222',
          boardId: '5',
          boardName: 'Roadmap',
          canMove: true,
          issueKey: 'ISS-1',
          spaceColor: '#333',
          spaceKey: 'product',
          spaceName: 'Product',
          status: 'Todo',
          statusCategory: 'Created',
          statusColor: '#444',
          statusId: '6',
          title: 'Fix search',
        },
        {
          assignee: 'Grace',
          assigneeColor: '#555',
          assigneeId: 'grace',
          assigneeInitial: '?',
          boardColor: '#666',
          boardId: '8',
          boardName: 'Backlog board',
          canMove: false,
          issueKey: 'ISS-2',
          spaceColor: '#777',
          spaceKey: 'product',
          spaceName: 'Product',
          status: null,
          statusCategory: undefined,
          statusColor: COLORS.gray,
          statusId: '9',
          title: '',
        },
      ],
    },
  )
})

test('maps filters, paging and search to the request body', async () => {
  const { client, requests } = createTestApiClient(response)

  await createIssuesPageDeps(client).searchIssues({
    epicStatuses: ['New', 'Active'],
    filters: [
      { attributeId: '3', searchString: 'urgent', type: 'text' },
      { attributeId: '4', type: 'list', valueIds: ['9'] },
    ],
    page: 2,
    search: 'search',
    spaceIds: ['5'],
  })

  assert.deepEqual(await requests[0]!.json(), {
    epicStatuses: ['New', 'Active'],
    filters: {
      '3': { $type: 'string', searchString: 'urgent' },
      '4': { $type: 'enum', ids: ['9'] },
    },
    page: 1,
    perPage: 20,
    searchString: 'search',
    sorting: { $type: 'property', direction: 'Descending', property: 'CreatedAt' },
    spaceKeys: ['5'],
  })
})

test('omits an empty search and space filter', async () => {
  const { client, requests } = createTestApiClient(response)

  await createIssuesPageDeps(client).searchIssues({
    epicStatuses: [],
    filters: [],
    page: 1,
    search: '',
    spaceIds: [],
  })

  assert.deepEqual(await requests[0]!.json(), {
    filters: {},
    page: 0,
    perPage: 20,
    sorting: { $type: 'property', direction: 'Descending', property: 'CreatedAt' },
  })
})
