import { assert, test } from 'vitest'

import { createTestApiClient } from '#infrastructure/api/testApiClient'

import { createUpdateMemberPermissions } from './updateMemberPermissions'

test('maps successful update', async () => {
  const { client, requests } = createTestApiClient()

  const result = await createUpdateMemberPermissions(client)({
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
        canRead: true,
        canUpdateBoards: false,
        canUpdateIssues: false,
        canUpdateSpaces: false,
      },
    },
  })

  assert.deepEqual(result, { data: true, status: 'success' })
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
      canRead: true,
      canUpdateEpics: false,
      canUpdateIssues: false,
      canUpdateSpaces: false,
    },
  })
})
