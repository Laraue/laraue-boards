import type { ApiClient } from '#infrastructure/api/client'
import type { components } from '#infrastructure/api/generated'
import { request } from '#infrastructure/api/request'

import type { GlobalProfile, ProfileSectionDeps } from './ProfileSection.deps'

const toGlobalProfile = (profile: components['schemas']['UserProfileDto']): GlobalProfile => ({
  displayName: profile.displayName,
  familyName: profile.familyName ?? '',
  givenName: profile.givenName ?? '',
})

export const createProfileSectionDeps = (client: ApiClient): ProfileSectionDeps => ({
  update: async ({ displayName, familyName, givenName }) =>
    toGlobalProfile(
      await request(
        client.PUT('/api/user/profile', {
          // An empty given/family name clears it.
          body: {
            displayName: displayName.trim(),
            familyName: familyName.trim() || null,
            givenName: givenName.trim() || null,
          },
        }),
      ),
    ),

  view: async ({ signal }) =>
    toGlobalProfile(await request(client.GET('/api/user/profile', { signal }))),
})
