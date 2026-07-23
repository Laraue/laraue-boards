import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'
import { COLORS } from '~/constants/colors'

import { createSearchIssues } from './searchIssues'

const response = () => ({
  data: [
    {
      assignee: 'Ada',
      assigneeColor: '#111',
      assigneeInitial: 'A',
      canEdit: true,
      content: 'Fix search',
      epic: { color: '#222', name: 'Roadmap' },
      key: 'ISS-1',
      space: { color: '#333', name: 'Product' },
      status: { color: '#444', name: 'Todo' },
    },
    {
      assignee: 'Grace',
      assigneeColor: '#555',
      assigneeInitial: null,
      canEdit: false,
      content: null,
      epic: { color: '#666', name: 'Backlog board' },
      key: 'ISS-2',
      space: { color: '#777', name: 'Product' },
      status: null,
    },
  ],
  hasNextPage: true,
})

test('maps searched issues', async () => {
  const { client } = createTestApiClient(response)

  assert.deepEqual(
    await createSearchIssues(client)({ filters: [], page: 1, search: 'search', spaceIds: [] }),
    {
      data: {
        hasNextPage: true,
        issues: [
          {
            assignee: 'Ada',
            assigneeColor: '#111',
            assigneeInitial: 'A',
            boardColor: '#222',
            boardName: 'Roadmap',
            canMove: true,
            content: 'Fix search',
            issueKey: 'ISS-1',
            spaceColor: '#333',
            spaceName: 'Product',
            status: 'Todo',
            statusColor: '#444',
          },
          {
            assignee: 'Grace',
            assigneeColor: '#555',
            assigneeInitial: '?',
            boardColor: '#666',
            boardName: 'Backlog board',
            canMove: false,
            content: '',
            issueKey: 'ISS-2',
            spaceColor: '#777',
            spaceName: 'Product',
            status: 'Backlog',
            statusColor: COLORS.gray,
          },
        ],
      },
      status: 'success',
    },
  )
})

test('maps filters, paging and search to the request body', async () => {
  const { client, requests } = createTestApiClient(response)

  await createSearchIssues(client)({
    filters: [
      { attributeId: '3', searchString: 'urgent', type: 'text' },
      { attributeId: '4', type: 'list', valueIds: ['9'] },
    ],
    page: 2,
    search: 'search',
    spaceIds: ['5'],
  })

  assert.deepEqual(await requests[0]!.json(), {
    filters: {
      '3': { $type: 'string', searchString: 'urgent' },
      '4': { $type: 'enum', ids: ['9'] },
    },
    page: 1,
    perPage: 10,
    searchString: 'search',
    sorting: { $type: 'property', direction: 1, property: 1 },
    spaceIds: ['5'],
  })
})

test('omits an empty search and space filter', async () => {
  const { client, requests } = createTestApiClient(response)

  await createSearchIssues(client)({ filters: [], page: 1, search: '', spaceIds: [] })

  assert.deepEqual(await requests[0]!.json(), {
    filters: {},
    page: 0,
    perPage: 10,
    sorting: { $type: 'property', direction: 1, property: 1 },
  })
})
