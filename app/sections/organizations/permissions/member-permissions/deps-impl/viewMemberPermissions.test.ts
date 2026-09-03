import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createViewMemberPermissions } from './viewMemberPermissions'

const members = [
  {
    adminAccessLevel: 'Manage, UpdateOrganization',
    color: '#4774d4',
    displayName: 'Ada Lovelace',
    initials: 'AL',
    isOwner: false,
    organizationUserId: 5,
  },
]

const spaces = [
  { color: '#000', isDefault: true, key: 'backlog', name: 'Backlog' },
  { color: '#fff', isDefault: false, key: 'product', name: 'Product' },
]

const permissions = {
  admin: 'Manage, UpdateOrganization',
  direct: { product: { canRead: true, canUpdate: true } },
  global: { canCreateEpics: true, canRead: true },
}

const respond = (_request: Request, path: string) => {
  if (path.endsWith('/members')) {
    return members
  }
  if (path.endsWith('/permittable-entities')) {
    return spaces
  }
  return permissions
}

test('maps member permissions response', async () => {
  const { client } = createTestApiClient(respond)

  assert.deepEqual(await createViewMemberPermissions(client)({ memberId: '5' }), {
    data: {
      member: {
        color: '#4774d4',
        id: '5',
        initials: 'AL',
        isAdmin: true,
        isOwner: false,
        name: 'Ada Lovelace',
      },
      permissions: {
        admin: {
          canDeleteOrganization: false,
          canManageAttributes: false,
          canManageMembers: true,
          canMoveData: false,
          canUpdateOrganization: true,
        },
        direct: {
          backlog: {
            canCreateBoards: false,
            canCreateIssues: false,
            canDelete: false,
            canDeleteBoards: false,
            canDeleteIssues: false,
            canRead: false,
            canUpdate: false,
            canUpdateBoards: false,
            canUpdateIssues: false,
          },
          product: {
            canCreateBoards: false,
            canCreateIssues: false,
            canDelete: false,
            canDeleteBoards: false,
            canDeleteIssues: false,
            canRead: true,
            canUpdate: true,
            canUpdateBoards: false,
            canUpdateIssues: false,
          },
        },
        global: {
          canCreateBoards: true,
          canCreateIssues: false,
          canCreateRetros: false,
          canCreateSpaces: false,
          canDeleteBoards: false,
          canDeleteIssues: false,
          canDeleteSpaces: false,
          canRead: true,
          canUpdateBoards: false,
          canUpdateIssues: false,
          canUpdateSpaces: false,
        },
      },
      spaces: [
        { color: '#000', id: 'backlog', isDefault: true, name: 'Backlog' },
        { color: '#fff', id: 'product', isDefault: false, name: 'Product' },
      ],
    },
    status: 'success',
  })
})

test('returns error when the member does not exist', async () => {
  const { client } = createTestApiClient(respond)

  assert.deepEqual(await createViewMemberPermissions(client)({ memberId: '999' }), {
    code: 404,
    status: 'error',
  })
})

test('returns error status when a request is forbidden', async () => {
  const { client } = createTestApiClient(() => new Response(null, { status: 403 }))

  assert.deepEqual(await createViewMemberPermissions(client)({ memberId: '5' }), {
    code: 403,
    status: 'error',
  })
})
