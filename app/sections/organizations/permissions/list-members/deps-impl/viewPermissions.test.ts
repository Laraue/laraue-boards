import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createViewPermissions } from './viewPermissions'

test('maps organization members and invitation code', async () => {
  const { client } = createTestApiClient((_request, path) =>
    path.endsWith('/join-code')
      ? new Response('invite-123', { headers: { 'content-type': 'text/plain' } })
      : [
          {
            adminAccessLevel: 'Manage',
            color: '#4774d4',
            displayName: 'Ada Lovelace',
            initials: 'AL',
            isOwner: true,
            organizationUserId: 5,
          },
          {
            adminAccessLevel: 'None',
            color: '#e5484d',
            displayName: 'Grace Hopper',
            initials: 'GH',
            isOwner: false,
            organizationUserId: 6,
          },
        ],
  )

  assert.deepEqual(await createViewPermissions(client)({}), {
    data: {
      joinCode: 'invite-123',
      members: [
        {
          color: '#4774d4',
          id: '5',
          initials: 'AL',
          isAdmin: true,
          isOwner: true,
          name: 'Ada Lovelace',
        },
        {
          color: '#e5484d',
          id: '6',
          initials: 'GH',
          isAdmin: false,
          isOwner: false,
          name: 'Grace Hopper',
        },
      ],
    },
    status: 'success',
  })
})

test('skips members without an id', async () => {
  const { client } = createTestApiClient((_request, path) =>
    path.endsWith('/join-code')
      ? new Response('invite-123', { headers: { 'content-type': 'text/plain' } })
      : [
          {
            adminAccessLevel: 'None',
            color: '#000',
            displayName: 'No id',
            initials: 'NI',
            isOwner: false,
          },
        ],
  )

  assert.deepEqual(await createViewPermissions(client)({}), {
    data: { joinCode: 'invite-123', members: [] },
    status: 'success',
  })
})
