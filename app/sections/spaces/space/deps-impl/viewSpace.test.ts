import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'
import { COLORS } from '~/constants/colors'

import { createViewSpace } from './viewSpace'

test('maps the space and its board summaries', async () => {
  const { client } = createTestApiClient((_request, path) => {
    if (path === '/api/spaces') {
      return [{ color: COLORS.blue, isDefault: false, key: 'WEB', name: 'Web' }]
    }
    if (path === '/api/spaces/WEB') {
      return { canCreateEpics: true, canDelete: true, canUpdate: true }
    }
    if (path === '/api/spaces/WEB/epics') {
      return [
        {
          color: null,
          id: 10,
          isDefault: true,
          name: 'Default',
          status: 'New',
          touchedAt: '2026-01-01T00:00:00Z',
        },
      ]
    }
    const backlog = {
      color: null,
      columns: [{ color: COLORS.gray, count: 2, id: 1, name: 'Inbox' }],
      createdAt: '2026-04-01T00:00:00Z',
      id: 10,
      isDefault: true,
      name: 'Default',
      touchedAt: '2026-04-01T00:00:00Z',
    }
    return [
      backlog,
      { ...backlog, createdAt: '2026-01-01T00:00:00Z', id: 11, isDefault: false, name: 'Old' },
      { ...backlog, createdAt: '2026-03-01T00:00:00Z', id: 13, isDefault: false, name: 'New' },
      { ...backlog, createdAt: '2026-02-01T00:00:00Z', id: 12, isDefault: false, name: 'Middle' },
    ]
  })

  const result = await createViewSpace(client)({ spaceKey: 'WEB' })

  assert.equal(result.status === 'success' && result.data.boards[0]?.kind, 'backlog')
  assert.equal(result.status === 'success' && result.data.boards[0]?.issueCount, 2)
  assert.equal(result.status === 'success' && result.data.boards[0]?.name, 'Backlog')
  assert.deepEqual(result.status === 'success' && result.data.boards.map((board) => board.name), [
    'Backlog',
    'New',
    'Middle',
    'Old',
  ])
})
