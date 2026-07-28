import type { ApiClient } from '#infrastructure/api/client'
import type { components } from '#infrastructure/api/generated'
import { tryRequest } from '#infrastructure/api/tryRequest'

import type { ViewMemberPermissions } from '../MemberPermissionsPage.deps'
import type { MemberPermissions } from '../MemberPermissionsPage.types'

type ApiUserPermissions = components['schemas']['UserPermissions']
type OrganizationMember = components['schemas']['OrganizationMember']

export const adminFlags = {
  canDeleteOrganization: 'DeleteOrganization',
  canManageAttributes: 'ManageAttributes',
  canManageMembers: 'Manage',
  canMoveData: 'MassMove',
  canUpdateOrganization: 'UpdateOrganization',
} as const

const mapOrganizationMembers = (members: OrganizationMember[]) =>
  members.flatMap((member) => {
    if (member.organizationUserId === undefined) {
      return []
    }
    return [
      {
        color: member.color,
        id: String(member.organizationUserId),
        initials: member.initials,
        isAdmin: member.adminAccessLevel !== 'None',
        isOwner: member.isOwner,
        name: member.displayName,
      },
    ]
  })

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
      canRead: global.canRead ?? false,
      canUpdateBoards: global.canUpdateEpics ?? false,
      canUpdateIssues: global.canUpdateIssues ?? false,
      canUpdateSpaces: global.canUpdateSpaces ?? false,
    },
  }
}

export const createViewMemberPermissions =
  (client: ApiClient): ViewMemberPermissions =>
  async ({ memberId, signal }) => {
    const responses = await tryRequest(() =>
      Promise.all([
        client.GET('/api/organizations/members', { signal }),
        client.GET('/api/organizations/permissions/{organizationUserId}', {
          params: { path: { organizationUserId: Number(memberId) } },
          signal,
        }),
        client.GET('/api/organizations/permittable-entities', { signal }),
      ]),
    )
    if (!responses) {
      return { code: 0, status: 'error' }
    }
    const [membersResponse, permissionsResponse, spacesResponse] = responses
    for (const response of responses) {
      if ('error' in response) {
        return { code: response.response.status, status: 'error' }
      }
    }
    if ('error' in membersResponse || 'error' in permissionsResponse || 'error' in spacesResponse) {
      throw new Error('Unreachable member permissions response')
    }
    const member = mapOrganizationMembers(membersResponse.data).find((item) => item.id === memberId)
    if (!member) {
      return { code: 404, status: 'error' }
    }
    const spaces = spacesResponse.data.map((space) => ({
      color: space.color,
      id: space.key,
      isDefault: space.isDefault,
      name: space.name,
    }))
    return {
      data: {
        member,
        permissions: mapMemberPermissions(
          permissionsResponse.data,
          spaces.map(({ id, isDefault }) => ({ id, isDefault })),
        ),
        spaces,
      },
      status: 'success',
    }
  }
