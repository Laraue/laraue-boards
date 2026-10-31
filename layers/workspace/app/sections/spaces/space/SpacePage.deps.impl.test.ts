import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'
import { COLORS } from '#layers/workspace/app/shared/constants/colors'

import { createSpacePageDeps } from './SpacePage.deps.impl'

test('maps the space and its board summaries', async () => {
  const { client } = createTestApiClient((_request, path) => {
    if (path === '/api/spaces') {
      return [{ color: COLORS.blue, key: 'WEB', name: 'Web' }]
    }
    if (path === '/api/spaces/WEB') {
      return { canCreateEpics: true, canDelete: true, canUpdate: true }
    }
    if (path === '/api/spaces/WEB/about') {
      return {
        canEdit: true,
        description: 'The **web** app.',
        links: [{ description: 'Nuxt app', id: 5, url: 'https://github.com/Laraue/laraue-boards' }],
      }
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
      columns: [{ category: 'Created', color: COLORS.gray, count: 2, id: 1, name: 'Inbox' }],
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

  const { about, boards } = await createSpacePageDeps(client).view({ spaceKey: 'WEB' })

  assert.equal(boards[0]?.kind, 'backlog')
  assert.equal(boards[0]?.issueCount, 2)
  assert.deepEqual(
    boards.map((board) => [board.name, board.createdAt]),
    [
      ['Backlog', '2026-04-01T00:00:00Z'],
      ['Old', '2026-01-01T00:00:00Z'],
      ['New', '2026-03-01T00:00:00Z'],
      ['Middle', '2026-02-01T00:00:00Z'],
    ],
  )
  assert.deepEqual(about, {
    description: 'The **web** app.',
    links: [{ description: 'Nuxt app', id: '5', url: 'https://github.com/Laraue/laraue-boards' }],
  })
})
