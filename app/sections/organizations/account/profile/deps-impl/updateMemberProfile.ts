import type { ApiClient } from '#infrastructure/api/client'
import { executeAction } from '#infrastructure/api/executeAction'

import type { UpdateMemberProfile } from '../MemberProfilePage.deps'

export const createUpdateMemberProfile =
  (client: ApiClient): UpdateMemberProfile =>
  ({ color, displayName }) =>
    executeAction({
      map: () => true,
      request: () =>
        client.PUT('/api/organizations/current/profile', {
          // No name takes it from the user's profile again.
          body: { color, displayName: displayName.trim() || null },
        }),
    })
