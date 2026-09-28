import type { components } from '#infrastructure/api/generated'

import type { GlobalProfile } from '../ProfileSection.types'

export const toGlobalProfile = (profile: components['schemas']['UserProfileDto']): GlobalProfile => ({
  displayName: profile.displayName,
  familyName: profile.familyName ?? '',
  givenName: profile.givenName ?? '',
})
