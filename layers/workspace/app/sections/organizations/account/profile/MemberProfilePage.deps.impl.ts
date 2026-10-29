import type { ApiClient } from '#infrastructure/api/client'
import { request } from '#infrastructure/api/request'

import type { MemberProfilePageDeps } from './MemberProfilePage.deps'

export const createMemberProfilePageDeps = (client: ApiClient): MemberProfilePageDeps => ({
  update: async ({ color, displayName }) => {
    await request(
      client.PUT('/api/organizations/current/profile', {
        // No name takes it from the user's profile again.
        body: { color, displayName: displayName.trim() || null },
      }),
    )
  },

  view: async ({ signal }) => {
    const { memberProfile } = await request(client.GET('/api/organizations/current', { signal }))
    return { color: memberProfile.color, displayName: memberProfile.displayName }
  },
})
