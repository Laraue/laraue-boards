import type { ApiClient } from '#infrastructure/api/client'
import type { components } from '#infrastructure/api/generated'
import { ApiError, request } from '#infrastructure/api/request'

import type { MemberPermissions, MemberPermissionsPageDeps } from './MemberPermissionsPage.deps'

type ApiUserPermissions = components['schemas']['UserPermissions']

const adminFlags = {
  canDeleteOrganization: 'DeleteOrganization',
  canManageAttributes: 'ManageAttributes',
  canManageMembers: 'Manage',
  canMoveData: 'MassMove',
  canUpdateOrganization: 'UpdateOrganization',
} as const

const mapMemberPermissions = (
  permissions: ApiUserPermissions,
  spaces: Array<{ id: string; isDefault: boolean }>,
): MemberPermissions => {
  const admin = new Set((permissions.admin ?? 'None').split(', '))
  const global = permissions.global ?? {}

  return {
    admin: {
      canDeleteOrganization: admin.has(adminFlags.canDeleteOrganization) || admin.has('All'),
      canManageAttributes: admin.has(adminFlags.canManageAttributes),
      canManageMembers: admin.has(adminFlags.canManageMembers) || admin.has('All'),
      canMoveData: admin.has(adminFlags.canMoveData) || admin.has('All'),
      canUpdateOrganization: admin.has(adminFlags.canUpdateOrganization) || admin.has('All'),
    },
    direct: Object.fromEntries(
      spaces.map((space) => {
        const direct = permissions.direct?.[space.id]
        return [
          space.id,
          {
            canCreateBoards: direct?.canCreateEpics ?? false,
            canCreateIssues: direct?.canCreateIssues ?? false,
            canDelete: space.isDefault ? false : (direct?.canDelete ?? false),
            canDeleteBoards: direct?.canDeleteEpics ?? false,
            canDeleteIssues: direct?.canDeleteIssues ?? false,
            canManageRetros: direct?.canManageRetros ?? false,
            canRead: direct?.canRead ?? false,
            canUpdate: direct?.canUpdate ?? false,
            canUpdateBoards: direct?.canUpdateEpics ?? false,
            canUpdateIssues: direct?.canUpdateIssues ?? false,
          },
        ]
      }),
    ),
    global: {
      canCreateBoards: global.canCreateEpics ?? false,
      canCreateIssues: global.canCreateIssues ?? false,
      canCreateSpaces: global.canCreateSpaces ?? false,
      canDeleteBoards: global.canDeleteEpics ?? false,
      canDeleteIssues: global.canDeleteIssues ?? false,
      canDeleteSpaces: global.canDeleteSpaces ?? false,
      canManageRetros: global.canManageRetros ?? false,
      canRead: global.canRead ?? false,
      canUpdateBoards: global.canUpdateEpics ?? false,
      canUpdateIssues: global.canUpdateIssues ?? false,
      canUpdateSpaces: global.canUpdateSpaces ?? false,
    },
  }
}

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
          canManageRetros: direct.canManageRetros,
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
    canCreateSpaces: permissions.global.canCreateSpaces,
    canDeleteEpics: permissions.global.canDeleteBoards,
    canDeleteIssues: permissions.global.canDeleteIssues,
    canDeleteSpaces: permissions.global.canDeleteSpaces,
    canManageRetros: permissions.global.canManageRetros,
    canRead: permissions.global.canRead,
    canUpdateEpics: permissions.global.canUpdateBoards,
    canUpdateIssues: permissions.global.canUpdateIssues,
    canUpdateSpaces: permissions.global.canUpdateSpaces,
  },
})

export const createMemberPermissionsPageDeps = (client: ApiClient): MemberPermissionsPageDeps => ({
  update: async ({ memberId, permissions }) => {
    await request(
      client.POST('/api/admin/organizations/permissions/{organizationUserId}', {
        body: { userPermissions: mapMemberPermissionsRequest(permissions) },
        params: { path: { organizationUserId: Number(memberId) } },
      }),
    )
  },

  view: async ({ memberId, signal }) => {
    const [members, permissions, spaces] = await Promise.all([
      request(client.GET('/api/admin/organizations/members', { signal })),
      request(
        client.GET('/api/admin/organizations/permissions/{organizationUserId}', {
          params: { path: { organizationUserId: Number(memberId) } },
          signal,
        }),
      ),
      request(client.GET('/api/admin/organizations/permittable-entities', { signal })),
    ])
    const member = members.find((item) => String(item.organizationUserId) === memberId)
    if (!member) {
      throw new ApiError(404)
    }
    return {
      member: {
        color: member.color,
        id: memberId,
        initials: member.initials,
        isAdmin: member.adminAccessLevel !== 'None',
        isOwner: member.isOwner,
        name: member.displayName,
      },
      permissions: mapMemberPermissions(
        permissions,
        spaces.map((space) => ({ id: space.key, isDefault: space.isDefault })),
      ),
      spaces: spaces.map((space) => ({
        color: space.color,
        id: space.key,
        isDefault: space.isDefault,
        name: space.name,
      })),
    }
  },
})
