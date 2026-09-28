import type { ApiClient } from '#infrastructure/api/client'
import { executeAction } from '#infrastructure/api/executeAction'

import type { UpdateGlobalProfile } from '../ProfileSection.deps'
import { toGlobalProfile } from './toGlobalProfile'

export const createUpdateGlobalProfile =
  (client: ApiClient): UpdateGlobalProfile =>
  ({ displayName, familyName, givenName }) =>
    executeAction({
      map: (profile) => profile && toGlobalProfile(profile),
      request: () =>
        client.PUT('/api/user/profile', {
          // An empty given/family name clears it.
          body: {
            displayName: displayName.trim(),
            familyName: familyName.trim() || null,
            givenName: givenName.trim() || null,
          },
        }),
    })
