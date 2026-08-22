import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createLoadAssignees } from './loadAssignees'

test('maps assignee options', async () => {
  const { client } = createTestApiClient(() => [
    {
      color: '#123456',
      displayName: 'Ada Lovelace',
      initials: 'AL',
      isCurrentUser: true,
      userId: 'user-1',
    },
  ])

  assert.deepEqual(await createLoadAssignees(client)({ spaceKey: 'product' }), {
    data: [
      {
        color: '#123456',
        initials: 'AL',
        isCurrentUser: true,
        label: 'Ada Lovelace',
        value: 'user-1',
      },
    ],
    status: 'success',
  })
})
