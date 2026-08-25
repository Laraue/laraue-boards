import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createLoadAssignees } from './loadAssignees'

test('loads visible users for the space and maps assignee options', async () => {
  const { client, requests } = createTestApiClient(() => [
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
  assert.equal(new URL(requests[0]!.url).pathname, '/api/organizations/members')
  assert.equal(new URL(requests[0]!.url).searchParams.get('spaceKey'), 'product')
})
