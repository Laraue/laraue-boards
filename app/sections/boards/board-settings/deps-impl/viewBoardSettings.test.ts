import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createViewBoardSettings } from './viewBoardSettings'

test('maps board settings and sorts columns', async () => {
  const { client } = createTestApiClient(() => ({
    canDelete: true,
    canUpdate: true,
    color: '#111',
    name: 'Roadmap',
    status: 'Active',
    statuses: [
      { color: '#222', id: 2, name: 'Done', sortOrder: 2 },
      { color: '#333', id: 1, name: 'To do', sortOrder: 1 },
    ],
  }))

  assert.deepEqual(await createViewBoardSettings(client)({ boardId: '12' }), {
    data: {
      canDelete: true,
      canUpdate: true,
      color: '#111',
      columns: [
        { color: '#333', id: '1', name: 'To do' },
        { color: '#222', id: '2', name: 'Done' },
      ],
      name: 'Roadmap',
      status: 'Active',
    },
    status: 'success',
  })
})
