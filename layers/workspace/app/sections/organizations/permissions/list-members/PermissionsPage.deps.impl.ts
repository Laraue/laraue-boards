import type { ApiClient } from '#infrastructure/api/client'
import { request } from '#infrastructure/api/request'

import type { PermissionsPageDeps } from './PermissionsPage.deps'

export const createPermissionsPageDeps = (client: ApiClient): PermissionsPageDeps => ({
  regenerateJoinCode: () =>
    request(client.POST('/api/admin/organizations/regenerate-join-code', { parseAs: 'text' })),

  view: async ({ signal }) => {
    const [members, joinCode] = await Promise.all([
      request(client.GET('/api/admin/organizations/members', { signal })),
      request(client.GET('/api/admin/organizations/join-code', { parseAs: 'text', signal })),
    ])
    return {
      joinCode,
      // A member without an organization user id cannot be linked to, so it is left out.
      members: members.flatMap((member) =>
        member.organizationUserId === undefined
          ? []
          : [
              {
                color: member.color,
                id: String(member.organizationUserId),
                initials: member.initials,
                isAdmin: member.adminAccessLevel !== 'None',
                isOwner: member.isOwner,
                name: member.displayName,
              },
            ],
      ),
    }
  },
})
