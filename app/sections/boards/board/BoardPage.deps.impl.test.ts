import { assert, expect, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createBoardPageDeps } from './BoardPage.deps.impl'

test('maps board columns in status order with their issues', async () => {
  const { client } = createTestApiClient((_request, path) => {
    if (path === '/api/organizations/attributes') {
      return []
    }
    if (path === '/api/spaces') {
      return [{ color: '#555', key: 'product', name: 'Product' }]
    }
    if (path === '/api/epics/7') {
      return {
        canCreateIssues: true,
        canDelete: true,
        canDeleteIssues: true,
        canUpdate: true,
        canUpdateIssues: true,
        color: '#111',
        name: 'Roadmap',
        status: 'Active',
        statuses: [
          { category: 'Completed', color: '#222', id: 2, name: 'Done', sortOrder: 2 },
          { category: 'Created', color: '#333', id: 1, name: 'To do', sortOrder: 1 },
        ],
      }
    }
    return [
      {
        items: {
          data: [
            {
              assignee: 'Ada',
              assigneeColor: '#444',
              assigneeInitial: null,
              content: null,
              epicId: 7,
              id: 1,
              key: 'ISS-1',
              spaceKey: 'product',
              statusId: 1,
              time: '2026-01-01T00:00:00Z',
              title: 'Fix it',
            },
          ],
          hasNext: true,
          offset: 1,
          totalCount: 2,
        },
        statusId: 1,
      },
    ]
  })

  assert.deepEqual(
    await createBoardPageDeps(client).view({
      attributeQuery: {},
      boardId: '7',
      search: '',
      spaceKey: 'product',
    }),
    {
      attributes: [],
      canCreateIssues: true,
      canDelete: true,
      canMoveIssues: true,
      canUpdate: true,
      color: '#111',
      columns: [
        {
          color: '#333',
          hasNext: true,
          id: '1',
          issueCount: 2,
          issues: [
            {
              assigneeColor: '#444',
              assigneeInitial: '?',
              assigneeName: 'Ada',
              issueKey: 'ISS-1',
              time: '2026-01-01T00:00:00Z',
              title: 'Fix it',
            },
          ],
          title: 'To do',
        },
        { color: '#222', hasNext: false, id: '2', issueCount: 0, issues: [], title: 'Done' },
      ],
      id: '7',
      issueCount: 2,
      spaceColor: '#555',
      spaceName: 'Product',
      title: 'Roadmap',
    },
  )
})

test('searches the board with the filters read from the query', async () => {
  const { client, requests } = createTestApiClient((_request, path) => {
    if (path === '/api/organizations/attributes') {
      return [{ color: '#111', id: 3, listValues: [], name: 'Priority', type: 'Text' }]
    }
    if (path === '/api/epics/7') {
      return { canCreateIssues: true, canUpdateIssues: true, name: 'Roadmap', statuses: [] }
    }
    return []
  })

  await createBoardPageDeps(client).view({
    attributeQuery: { 3: ['urgent'] },
    boardId: '7',
    search: 'bug',
    spaceKey: 'product',
  })

  const search = requests.find((value) => new URL(value.url).pathname === '/api/issues/board')
  assert.deepEqual(await search?.json(), {
    epicId: '7',
    filters: { '3': { $type: 'string', searchString: 'urgent' } },
    searchString: 'bug',
    take: 25,
  })
})

test('rejects an empty destination and moves to a selected status', async () => {
  const { client, paths, requests } = createTestApiClient(() => new Response(null, { status: 204 }))
  const { moveBoardIssue } = createBoardPageDeps(client)

  await expect(
    moveBoardIssue({ issueKey: 'ISS-1', statusId: '', updateStatus: true }),
  ).rejects.toMatchObject({ status: 400 })
  await moveBoardIssue({ issueKey: 'ISS-1', statusId: '3', updateStatus: true })
  assert.deepEqual(paths(), ['/api/issues/status'])
  assert.deepEqual(await requests[0]!.json(), { issueKeys: ['ISS-1'], statusId: 3 })
})

test('orders an issue inside its column without touching the status', async () => {
  const { client, paths, requests } = createTestApiClient(() => new Response(null, { status: 204 }))

  await createBoardPageDeps(client).moveBoardIssue({
    issueKey: 'ISS-1',
    statusId: '3',
    target: { issueKey: 'ISS-2', position: 'Before' },
    updateStatus: false,
  })
  assert.deepEqual(paths(), ['/api/issues/order'])
  assert.deepEqual(await requests[0]!.json(), {
    issueKeys: ['ISS-1'],
    targetKey: 'ISS-2',
    targetType: 'Before',
  })
})

test('changes the status and then the order when dropped into another column', async () => {
  const { client, paths, requests } = createTestApiClient(() => new Response(null, { status: 204 }))

  await createBoardPageDeps(client).moveBoardIssue({
    issueKey: 'ISS-1',
    statusId: '3',
    target: { issueKey: 'ISS-2', position: 'After' },
    updateStatus: true,
  })
  assert.deepEqual(paths(), ['/api/issues/status', '/api/issues/order'])
  assert.deepEqual(await requests[1]!.json(), {
    issueKeys: ['ISS-1'],
    targetKey: 'ISS-2',
    targetType: 'After',
  })
})

test('skips the order request when the status request fails', async () => {
  const { client, paths } = createTestApiClient(() => new Response(null, { status: 500 }))

  await expect(
    createBoardPageDeps(client).moveBoardIssue({
      issueKey: 'ISS-1',
      statusId: '3',
      target: { issueKey: 'ISS-2', position: 'After' },
      updateStatus: true,
    }),
  ).rejects.toMatchObject({ status: 500 })
  assert.deepEqual(paths(), ['/api/issues/status'])
})

test('finds the first backlog status and moves the issue there', async () => {
  const { client, paths } = createTestApiClient((_request, path) => {
    if (path === '/api/spaces/product/epics') {
      return [
        { id: 7, isDefault: false, name: 'Roadmap' },
        { id: 8, isDefault: true, name: 'Backlog' },
      ]
    }
    if (path === '/api/epics/8') {
      return {
        canCreateIssues: false,
        canDeleteIssues: false,
        canUpdateIssues: false,
        color: null,
        name: 'Backlog',
        statuses: [
          { color: null, id: 5, name: 'Later', sortOrder: 2 },
          { color: null, id: 4, name: 'Inbox', sortOrder: 1 },
        ],
      }
    }
    return new Response(null, { status: 204 })
  })

  await createBoardPageDeps(client).moveIssueToBacklog({
    boardId: '7',
    issueKey: 'ISS-1',
    spaceKey: 'product',
  })
  assert.deepEqual(paths(), ['/api/spaces/product/epics', '/api/epics/8', '/api/issues/status'])
})
