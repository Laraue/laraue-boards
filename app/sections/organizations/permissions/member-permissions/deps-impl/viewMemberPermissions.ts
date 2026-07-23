import type { ApiClient } from '#infrastructure/api/client'
import type { components } from '#infrastructure/api/generated'
import { tryRequest } from '#infrastructure/api/tryRequest'

import type { ViewMemberPermissions } from '../MemberPermissionsPage.deps'
import type { MemberPermissions } from '../MemberPermissionsPage.types'

type ApiUserPermissions = components['schemas']['UserPermissions']
type OrganizationMember = components['schemas']['OrganizationMember']

export const adminFlags = {
  canDeleteOrganization: 4,
  canManageAttributes: 16,
  canManageMembers: 1,
  canMoveData: 8,
  canUpdateOrganization: 2,
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
        isAdmin: member.adminAccessLevel !== 0,
        isOwner: member.isOwner,
        name: member.displayName,
      },
    ]
  })

const mapMemberPermissions = (
  permissions: ApiUserPermissions,
  spaces: Array<{ id: string; isDefault: boolean }>,
): MemberPermissions => {
  const admin = permissions.admin ?? 0
  const global = permissions.global ?? {}

  return {
    admin: {
      canDeleteOrganization: (admin & adminFlags.canDeleteOrganization) !== 0,
      canManageAttributes: (admin & adminFlags.canManageAttributes) !== 0,
      canManageMembers: (admin & adminFlags.canManageMembers) !== 0,
      canMoveData: (admin & adminFlags.canMoveData) !== 0,
      canUpdateOrganization: (admin & adminFlags.canUpdateOrganization) !== 0,
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
      id: String(space.id),
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
