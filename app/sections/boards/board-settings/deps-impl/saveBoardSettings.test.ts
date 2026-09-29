import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createSaveBoardSettings } from './saveBoardSettings'

test('saves board and column changes', async () => {
  const { client, requests } = createTestApiClient((request, path) =>
    request.method === 'POST' && path === '/api/statuses' ? 9 : new Response(null, { status: 200 }),
  )

  const result = await createSaveBoardSettings(client)({
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

  assert.deepEqual(result, { data: true, status: 'success' })
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

  await createSaveBoardSettings(client)({
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
