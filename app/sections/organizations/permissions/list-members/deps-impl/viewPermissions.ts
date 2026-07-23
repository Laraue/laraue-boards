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
        isAdmin: member.adminAccessLevel !== 0,
        isOwner: member.isOwner,
        name: member.displayName,
      },
    ]
  })

export const createViewPermissions =
  (client: ApiClient): ViewPermissions =>
  ({ signal }) =>
    executeQuery({
      map: (members) => members && mapOrganizationMembers(members),
      request: () => client.GET('/api/organizations/members', { signal }),
    })
