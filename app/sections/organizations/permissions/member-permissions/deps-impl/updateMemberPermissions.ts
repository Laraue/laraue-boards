import type { ApiClient } from '#infrastructure/api/client'
import { executeAction } from '#infrastructure/api/executeAction'
import type { components } from '#infrastructure/api/generated'

import type { UpdateMemberPermissions } from '../MemberPermissionsPage.deps'
import type { MemberPermissions } from '../MemberPermissionsPage.types'
import { adminFlags } from './viewMemberPermissions'

type ApiUserPermissions = components['schemas']['UserPermissions']

const mapMemberPermissionsRequest = (permissions: MemberPermissions): ApiUserPermissions => ({
  admin:
    Object.entries(adminFlags)
      .filter(([key]) => permissions.admin[key as keyof MemberPermissions['admin']])
      .map(([, flag]) => flag)
      .join(', ') || 'None',
  direct: Object.fromEntries(
    Object.entries(permissions.direct)
      .filter(([, direct]) => Object.values(direct).some(Boolean))
      .map(([spaceId, direct]) => [
        spaceId,
        {
          canCreateEpics: direct.canCreateBoards,
          canCreateIssues: direct.canCreateIssues,
          canDelete: direct.canDelete,
          canDeleteEpics: direct.canDeleteBoards,
          canDeleteIssues: direct.canDeleteIssues,
          canRead: direct.canRead,
          canUpdate: direct.canUpdate,
          canUpdateEpics: direct.canUpdateBoards,
          canUpdateIssues: direct.canUpdateIssues,
        },
      ]),
  ),
  global: {
    canCreateEpics: permissions.global.canCreateBoards,
    canCreateIssues: permissions.global.canCreateIssues,
    canCreateRetros: permissions.global.canCreateRetros,
    canCreateSpaces: permissions.global.canCreateSpaces,
    canDeleteEpics: permissions.global.canDeleteBoards,
    canDeleteIssues: permissions.global.canDeleteIssues,
    canDeleteSpaces: permissions.global.canDeleteSpaces,
    canRead: permissions.global.canRead,
    canUpdateEpics: permissions.global.canUpdateBoards,
    canUpdateIssues: permissions.global.canUpdateIssues,
    canUpdateSpaces: permissions.global.canUpdateSpaces,
  },
})

export const createUpdateMemberPermissions =
  (client: ApiClient): UpdateMemberPermissions =>
  (input) =>
    executeAction({
      map: () => true,
      request: () =>
        client.POST('/api/admin/organizations/permissions/{organizationUserId}', {
          body: { userPermissions: mapMemberPermissionsRequest(input.permissions) },
          params: { path: { organizationUserId: Number(input.memberId) } },
        }),
    })
