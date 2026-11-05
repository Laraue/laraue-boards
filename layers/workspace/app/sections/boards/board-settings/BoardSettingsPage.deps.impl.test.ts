import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createBoardSettingsPageDeps } from './BoardSettingsPage.deps.impl'

const catalog = () => ({
  attributes: [],
  spaces: [{ color: '#4774d4', key: 'product', name: 'Product' }],
})

test('saves the board, its columns and attribute settings in one request', async () => {
  const { client, requests } = createTestApiClient(() => new Response(null, { status: 200 }))

  await createBoardSettingsPageDeps(client, catalog).save({
    attributeSettings: {
      overridden: true,
      settings: [{ id: '5', isEnabled: true, showOnCard: false }],
    },
    boardId: '7',
    color: '#111',
    columns: [
      { category: 'InProgress', color: '#222', id: '2', name: 'Doing' },
      { category: 'Completed', color: '#444', id: null, name: 'Done' },
    ],
    name: 'Roadmap',
  })

  assert.deepEqual(
    requests.map((request) => [request.method, new URL(request.url).pathname]),
    [['PUT', '/api/epics/7']],
  )
  assert.deepEqual(await requests[0]!.json(), {
    attributeSettings: {
      overridden: true,
      settings: [{ attributeId: 5, isEnabled: true, showOnCard: false }],
    },
    color: '#111',
    columns: [
      { category: 'InProgress', color: '#222', id: 2, name: 'Doing' },
      { category: 'Completed', color: '#444', id: null, name: 'Done' },
    ],
    id: 7,
    name: 'Roadmap',
  })
})

test('leaves attribute settings alone when they did not change', async () => {
  const { client, requests } = createTestApiClient(() => new Response(null, { status: 200 }))

  await createBoardSettingsPageDeps(client, catalog).save({
    attributeSettings: null,
    boardId: '7',
    color: '#111',
    columns: [],
    name: 'Roadmap',
  })

  assert.equal((await requests[0]!.json()).attributeSettings, null)
})

test('maps board settings and sorts columns', async () => {
  const { client } = createTestApiClient((_request, path) =>
    path === '/api/epics/12/attribute-settings'
      ? {
          attributes: [
            {
              attributeId: 5,
              color: '#555',
              isEnabled: true,
              name: 'Type',
              showOnCard: true,
              type: 'Text',
            },
          ],
          inherited: { attributes: [], source: 'Space' },
          source: 'Epic',
        }
      : {
          canDelete: true,
          canUpdate: true,
          color: '#111',
          isDefault: false,
          name: 'Roadmap',
          status: 'Active',
          statuses: [
            { category: 'Completed', color: '#222', id: 2, name: 'Done', sortOrder: 2 },
            { category: 'Created', color: '#333', id: 1, name: 'To do', sortOrder: 1 },
          ],
        },
  )

  const view = await createBoardSettingsPageDeps(client, catalog).view({
    boardId: '12',
    spaceKey: 'product',
  })
  assert.deepEqual(view, {
    attributeSettings: {
      attributes: [{ color: '#555', id: '5', isEnabled: true, name: 'Type', showOnCard: true }],
      inherited: { attributes: [], source: 'space' },
      source: 'epic',
    },
    canDelete: true,
    canUpdate: true,
    color: '#111',
    columns: [
      { category: 'Created', color: '#333', id: '1', name: 'To do' },
      { category: 'Completed', color: '#222', id: '2', name: 'Done' },
    ],
    isDefault: false,
    name: 'Roadmap',
    spaceColor: '#4774d4',
    spaceName: 'Product',
  })
})
