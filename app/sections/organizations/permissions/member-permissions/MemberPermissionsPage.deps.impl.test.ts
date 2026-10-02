import { assert, expect, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createMemberPermissionsPageDeps } from './MemberPermissionsPage.deps.impl'

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
  direct: { product: { canManageRetros: true, canRead: true, canUpdate: true } },
  global: { canCreateEpics: true, canManageRetros: true, canRead: true },
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

  assert.deepEqual(await createMemberPermissionsPageDeps(client).view({ memberId: '5' }), {
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
          canManageRetros: false,
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
          canManageRetros: true,
          canRead: true,
          canUpdate: true,
          canUpdateBoards: false,
          canUpdateIssues: false,
        },
      },
      global: {
        canCreateBoards: true,
        canCreateIssues: false,
        canCreateSpaces: false,
        canDeleteBoards: false,
        canDeleteIssues: false,
        canDeleteSpaces: false,
        canManageRetros: true,
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
  })
})

test('fails with 404 when the member does not exist', async () => {
  const { client } = createTestApiClient(respond)

  await expect(
    createMemberPermissionsPageDeps(client).view({ memberId: '999' }),
  ).rejects.toMatchObject({ status: 404 })
})

test('sends admin flags and renamed board permissions', async () => {
  const { client, requests } = createTestApiClient()

  await createMemberPermissionsPageDeps(client).update({
    memberId: '5',
    permissions: {
      admin: {
        canDeleteOrganization: false,
        canManageAttributes: false,
        canManageMembers: true,
        canMoveData: false,
        canUpdateOrganization: false,
      },
      direct: {
        '11': {
          canCreateBoards: false,
          canCreateIssues: false,
          canDelete: false,
          canDeleteBoards: false,
          canDeleteIssues: false,
          canManageRetros: true,
          canRead: true,
          canUpdate: false,
          canUpdateBoards: false,
          canUpdateIssues: false,
        },
      },
      global: {
        canCreateBoards: false,
        canCreateIssues: false,
        canCreateSpaces: false,
        canDeleteBoards: false,
        canDeleteIssues: false,
        canDeleteSpaces: false,
        canManageRetros: true,
        canRead: true,
        canUpdateBoards: false,
        canUpdateIssues: false,
        canUpdateSpaces: false,
      },
    },
  })

  const body = (await requests[0]!.json()) as { userPermissions: unknown }
  assert.deepEqual(body.userPermissions, {
    admin: 'Manage',
    direct: {
      '11': {
        canCreateEpics: false,
        canCreateIssues: false,
        canDelete: false,
        canDeleteEpics: false,
        canDeleteIssues: false,
        canManageRetros: true,
        canRead: true,
        canUpdate: false,
        canUpdateEpics: false,
        canUpdateIssues: false,
      },
    },
    global: {
      canCreateEpics: false,
      canCreateIssues: false,
      canCreateSpaces: false,
      canDeleteEpics: false,
      canDeleteIssues: false,
      canDeleteSpaces: false,
      canManageRetros: true,
      canRead: true,
      canUpdateEpics: false,
      canUpdateIssues: false,
      canUpdateSpaces: false,
    },
  })
})
