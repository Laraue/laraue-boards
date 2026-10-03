import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createBoardSettingsPageDeps } from './BoardSettingsPage.deps.impl'

test('saves board and column changes', async () => {
  const { client, requests } = createTestApiClient((request, path) =>
    request.method === 'POST' && path === '/api/statuses' ? 9 : new Response(null, { status: 200 }),
  )

  await createBoardSettingsPageDeps(client).save({
    boardId: '7',
    color: '#111',
    columns: [
      { category: 'InProgress', color: '#222', id: '2', name: 'Doing' },
      { category: 'Completed', color: '#444', id: null, name: 'Done' },
    ],
    name: 'Roadmap',
    originalColumns: [
      { category: 'Created', color: '#000', id: '2', name: 'Todo' },
      { category: 'InProgress', color: '#333', id: '3', name: 'Later' },
    ],
    originalStatus: 'New',
    status: 'Done',
  })

  assert.deepEqual(
    requests.map((request) => [request.method, new URL(request.url).pathname]),
    [
      ['PUT', '/api/epics/7'],
      ['POST', '/api/epics/7/status'],
      ['POST', '/api/statuses'],
      ['PUT', '/api/statuses/2'],
      ['DELETE', '/api/statuses/3'],
      ['POST', '/api/epics/7/reorder-statuses'],
    ],
  )
  assert.deepEqual(await requests[2]!.json(), {
    category: 'Completed',
    color: '#444',
    epicId: '7',
    name: 'Done',
  })
  assert.deepEqual(await requests[3]!.json(), {
    category: 'InProgress',
    color: '#222',
    id: '2',
    name: 'Doing',
  })
  assert.deepEqual(await requests[5]!.json(), { 2: 1, 9: 2 })
})

test('updates a column when only its category changed', async () => {
  const { client, requests } = createTestApiClient(() => new Response(null, { status: 200 }))
  const column = { color: '#222', id: '2', name: 'Doing' }

  await createBoardSettingsPageDeps(client).save({
    boardId: '7',
    color: '#111',
    columns: [{ ...column, category: 'Completed' }],
    name: 'Roadmap',
    originalColumns: [{ ...column, category: 'InProgress' }],
    originalStatus: 'New',
    status: 'New',
  })

  assert.deepEqual(
    requests.map((request) => [request.method, new URL(request.url).pathname]),
    [
      ['PUT', '/api/epics/7'],
      ['PUT', '/api/statuses/2'],
      ['POST', '/api/epics/7/reorder-statuses'],
    ],
  )
  assert.deepEqual(await requests[1]!.json(), {
    category: 'Completed',
    color: '#222',
    id: '2',
    name: 'Doing',
  })
})

test('maps board settings and sorts columns', async () => {
  const { client } = createTestApiClient((_request, path) =>
    path === '/api/spaces'
      ? [{ key: 'product', name: 'Product' }]
      : {
          canDelete: true,
          canUpdate: true,
          color: '#111',
          name: 'Roadmap',
          status: 'Active',
          statuses: [
            { category: 'Completed', color: '#222', id: 2, name: 'Done', sortOrder: 2 },
            { category: 'Created', color: '#333', id: 1, name: 'To do', sortOrder: 1 },
          ],
        },
  )

  const view = await createBoardSettingsPageDeps(client).view({
    boardId: '12',
    spaceKey: 'product',
  })
  assert.deepEqual(view, {
    canDelete: true,
    canUpdate: true,
    color: '#111',
    columns: [
      { category: 'Created', color: '#333', id: '1', name: 'To do' },
      { category: 'Completed', color: '#222', id: '2', name: 'Done' },
    ],
    name: 'Roadmap',
    spaceName: 'Product',
    status: 'Active',
  })
})
