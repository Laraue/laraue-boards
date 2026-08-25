import type { ApiClient } from '#infrastructure/api/client'
import { executeQuery } from '#infrastructure/api/executeQuery'
import type { components } from '#infrastructure/api/generated'

import type { ViewPermissions } from '../PermissionsPage.deps'

type OrganizationMember = components['schemas']['OrganizationMember']

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

export const createViewPermissions =
  (client: ApiClient): ViewPermissions =>
  async ({ signal }) => {
    const [members, joinCode] = await Promise.all([
      executeQuery({
        map: mapOrganizationMembers,
        request: () => client.GET('/api/admin/organizations/members', { signal }),
      }),
      executeQuery({
        map: (code: string) => code || undefined,
        request: () =>
          client.GET('/api/admin/organizations/join-code', { parseAs: 'text', signal }),
      }),
    ])

    if (members.status === 'error') {
      return members
    }
    if (joinCode.status === 'error') {
      return joinCode
    }
    return {
      data: { joinCode: joinCode.data, members: members.data },
      status: 'success',
    }
  }
