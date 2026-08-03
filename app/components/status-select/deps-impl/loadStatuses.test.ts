import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createLoadStatuses } from './loadStatuses'

test('does not request statuses without a board', async () => {
  const { client, paths } = createTestApiClient(() => undefined)

  assert.deepEqual(await createLoadStatuses(client)({ boardId: '' }), {
    data: [],
    status: 'success',
  })
  assert.deepEqual(paths(), [])
})

test('sorts and maps status options', async () => {
  const { client } = createTestApiClient(() => ({
    statuses: [
      { id: 5, name: 'Done', sortOrder: 2 },
      { id: 4, name: 'Todo', sortOrder: 1 },
    ],
  }))

  assert.deepEqual(await createLoadStatuses(client)({ boardId: '3' }), {
    data: [
      { label: 'Todo', value: '4' },
      { label: 'Done', value: '5' },
    ],
    status: 'success',
  })
})
