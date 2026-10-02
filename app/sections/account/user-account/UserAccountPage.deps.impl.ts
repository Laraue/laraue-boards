import type { ApiClient } from '#infrastructure/api/client'
import { isApiError, request } from '#infrastructure/api/request'
import type { AppPreferences } from '~/composables/useAppPreferences'

import { createConnectedAccountsSectionDeps } from './components/ConnectedAccountsSection/ConnectedAccountsSection.deps.impl'
import { createProfileSectionDeps } from './components/ProfileSection/ProfileSection.deps.impl'
import type { UserAccountPageDeps } from './UserAccountPage.deps'

export const createUserAccountPageDeps = (
  client: ApiClient,
  preferences: AppPreferences,
): UserAccountPageDeps => ({
  connectedAccounts: createConnectedAccountsSectionDeps(client),
  interface: preferences,

  // Signing out goes ahead even when the request fails.
  logout: async () => {
    await request(client.POST('/api/user/logout')).catch(() => undefined)
  },

  profile: createProfileSectionDeps(client),

  // A signed-out visitor is sent to the login page rather than shown a failure.
  view: async ({ signal }) => {
    try {
      const user = await request(client.GET('/api/user', { signal }))
      return { initials: user.initials ?? null, kind: 'signed-in' }
    } catch (error) {
      if (isApiError(error, 401)) {
        return { kind: 'signed-out' }
      }
      throw error
    }
  },
})
