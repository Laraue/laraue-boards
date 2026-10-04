import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'
import { COLORS } from '~/constants/colors'

import { createStatusSelectDeps } from './StatusSelect.deps.impl'

test('does not request statuses without a board', async () => {
  const { client, paths } = createTestApiClient(() => undefined)

  assert.deepEqual(await createStatusSelectDeps(client).loadStatuses({ boardId: '' }), [])
  assert.deepEqual(paths(), [])
})

test('sorts and maps status options', async () => {
  const { client } = createTestApiClient(() => ({
    statuses: [
      { category: 'Completed', color: '#35805e', id: 5, name: 'Done', sortOrder: 2 },
      { category: 'Created', color: null, id: 4, name: 'Todo', sortOrder: 1 },
    ],
  }))

  assert.deepEqual(await createStatusSelectDeps(client).loadStatuses({ boardId: '3' }), [
    { category: 'Created', color: COLORS.gray, label: 'Todo', value: '4' },
    { category: 'Completed', color: '#35805e', label: 'Done', value: '5' },
  ])
})
