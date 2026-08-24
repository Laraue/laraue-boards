import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createLoadInitialOrganizationHistory } from './loadInitialOrganizationHistory'

test('loads filter options and first history page', async () => {
  const { client } = createTestApiClient((_request, path) =>
    path === '/api/organizations/members'
      ? [
          {
            adminAccessLevel: 'None',
            color: '#111',
            displayName: 'Ada',
            initials: 'A',
            isOwner: false,
            organizationUserId: 1,
            userId: '00000000-0000-0000-0000-000000000001',
          },
        ]
      : { data: [], hasNextPage: false },
  )

  assert.deepEqual(await createLoadInitialOrganizationHistory(client)({}), {
    data: {
      history: { hasNextPage: false, items: [] },
      users: [
        {
          label: 'Ada',
          value: '00000000-0000-0000-0000-000000000001',
        },
      ],
    },
    status: 'success',
  })
})
